import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Contract } from './entities/contract.entity';
import { Position } from '../survey/entities/position.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@Injectable()
export class AssignmentService {
    constructor(
        @InjectRepository(Assignment)
        private assignmentRepository: Repository<Assignment>,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(Position)
        private positionRepository: Repository<Position>,
    ) { }

    async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
        console.log('[AssignmentService] Creating assignment:', createAssignmentDto);

        // Validate contract exists and is active
        const contract = await this.contractRepository.findOne({
            where: { id: createAssignmentDto.contractId },
            relations: ['assignments'],
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        if (contract.status !== 'ACTIVE') {
            throw new BadRequestException('Cannot create assignment for inactive contract');
        }

        // Validate position exists
        const position = await this.positionRepository.findOne({
            where: { id: createAssignmentDto.positionId },
        });

        if (!position) {
            throw new NotFoundException('Position not found');
        }

        // Validate total workload doesn't exceed 100%
        const currentTotalWorkload = contract.assignments.reduce((sum, a) => sum + a.workloadPercentage, 0);
        if (currentTotalWorkload + createAssignmentDto.workloadPercentage > 100) {
            throw new BadRequestException(
                `Total workload exceeds 100%. Current: ${currentTotalWorkload}%, Requested: ${createAssignmentDto.workloadPercentage}%`,
            );
        }

        const assignment = this.assignmentRepository.create(createAssignmentDto);
        const savedAssignment = await this.assignmentRepository.save(assignment);

        console.log('[AssignmentService] Assignment created successfully:', savedAssignment.id);

        return savedAssignment;
    }

    async findAll(): Promise<Assignment[]> {
        return this.assignmentRepository.find({
            relations: ['contract', 'contract.user', 'position'],
        });
    }

    async findOne(id: string): Promise<Assignment> {
        const assignment = await this.assignmentRepository.findOne({
            where: { id },
            relations: ['contract', 'contract.user', 'position'],
        });

        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${id} not found`);
        }

        return assignment;
    }

    async update(id: string, updateData: Partial<Assignment>): Promise<Assignment> {
        const assignment = await this.findOne(id);

        // If workload is being updated, validate it
        if (updateData.workloadPercentage !== undefined) {
            const contract = await this.contractRepository.findOne({
                where: { id: assignment.contractId },
                relations: ['assignments'],
            });

            if (contract) {
                // Calculate total workload excluding current assignment
                const otherAssignments = contract.assignments.filter(a => a.id !== id);
                const currentTotalWorkload = otherAssignments.reduce((sum, a) => sum + a.workloadPercentage, 0);

                if (currentTotalWorkload + updateData.workloadPercentage > 100) {
                    throw new BadRequestException(
                        `Total workload exceeds 100%. Current (excluding this): ${currentTotalWorkload}%, Requested: ${updateData.workloadPercentage}%`,
                    );
                }
            }
        }

        // Update fields
        Object.assign(assignment, updateData);

        const savedAssignment = await this.assignmentRepository.save(assignment);

        return savedAssignment;
    }

    async remove(id: string): Promise<void> {
        const assignment = await this.findOne(id);
        await this.assignmentRepository.remove(assignment);

        console.log(`[AssignmentService] Assignment ${id} removed.`);
    }
}
