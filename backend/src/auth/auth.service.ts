import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../survey/entities/user.entity';
import { Position } from '../survey/entities/position.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePositionDto } from './dto/create-position.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['position', 'manager'],
    });

    if (!user) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال است');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        employeeId: user.employeeId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        position: user.position,
        manager: user.manager,
      },
    };
  }


  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('رمز عبور فعلی اشتباه است');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.userRepository.update(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['position', 'manager', 'subordinates'],
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    return {
      id: user.id,
      employeeId: user.employeeId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      position: user.position,
      manager: user.manager,
      subordinates: user.subordinates,
      lastLoginAt: user.lastLoginAt,
    };
  }

  // Admin methods for user management
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if username or employeeId already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { employeeId: createUserDto.employeeId },
      ],
    });

    if (existingUser) {
      throw new ConflictException('کاربر با این نام کاربری یا کد پرسنلی قبلاً وجود دارد');
    }

    // Auto-assign manager based on position hierarchy
    let managerId = createUserDto.managerId;
    if (createUserDto.positionId && !managerId) {
      // Find the position and its manager
      const position = await this.positionRepository.findOne({
        where: { id: createUserDto.positionId },
        relations: ['employees'],
      });

      if (position) {
        // Find the manager of this position (first employee in parent position)
        if (position.parentPositionId) {
          const parentPosition = await this.positionRepository.findOne({
            where: { id: position.parentPositionId },
            relations: ['employees'],
          });

          if (parentPosition && parentPosition.employees && parentPosition.employees.length > 0) {
            // Assign the first employee of the parent position as manager
            managerId = parentPosition.employees[0].id;
          }
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user object with sanitized IDs
    const userData: any = {
      employeeId: createUserDto.employeeId,
      username: createUserDto.username,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hashedPassword,
      role: createUserDto.role,
      positionId: createUserDto.positionId || null,
      managerId: managerId || null,
    };

    // Remove empty strings that might have slipped through
    if (userData.positionId === '') userData.positionId = null;
    if (userData.managerId === '') userData.managerId = null;

    const user = this.userRepository.create(userData as DeepPartial<User>);

    return this.userRepository.save(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['position', 'manager', 'subordinates'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['position', 'manager', 'subordinates'],
    });

    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);

    // Check username uniqueness if being updated
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser) {
        throw new ConflictException('نام کاربری قبلاً استفاده شده است');
      }
    }

    const updateData: any = { ...updateUserDto };

    // Sanitize GUID fields
    if (updateData.positionId === '') updateData.positionId = null;
    if (updateData.managerId === '') updateData.managerId = null;

    await this.userRepository.update(id, updateData);
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
  }


  // Admin methods for position management
  async createPosition(createPositionDto: CreatePositionDto): Promise<Position> {
    // Check if position title already exists
    const existingPosition = await this.positionRepository.findOne({
      where: { title: createPositionDto.title },
    });

    if (existingPosition) {
      throw new ConflictException('سمت با این عنوان قبلاً وجود دارد');
    }

    // Handle empty parentPositionId - convert empty string to undefined
    const positionData = {
      ...createPositionDto,
      parentPositionId: createPositionDto.parentPositionId === '' ? undefined : createPositionDto.parentPositionId,
    };

    const position = this.positionRepository.create(positionData);
    return this.positionRepository.save(position);
  }

  async getAllPositions(): Promise<Position[]> {
    return this.positionRepository.find({
      relations: ['parentPosition', 'childPositions', 'employees'],
      order: { order: 'ASC', title: 'ASC' },
    });
  }

  async getPositionById(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['childPositions', 'employees'],
    });

    if (!position) {
      throw new BadRequestException('سمت یافت نشد');
    }

    return position;
  }

  async updatePosition(id: string, updateData: Partial<CreatePositionDto>): Promise<Position> {
    const position = await this.getPositionById(id);

    // Check title uniqueness if being updated
    if (updateData.title && updateData.title !== position.title) {
      const existingPosition = await this.positionRepository.findOne({
        where: { title: updateData.title },
      });
      if (existingPosition) {
        throw new ConflictException('سمت با این عنوان قبلاً وجود دارد');
      }
    }

    // Handle empty parentPositionId - convert empty string to undefined
    const updateDataWithNull = {
      ...updateData,
      parentPositionId: updateData.parentPositionId === '' ? undefined : updateData.parentPositionId,
    };

    await this.positionRepository.update(id, updateDataWithNull);
    return this.getPositionById(id);
  }

  async deletePosition(id: string): Promise<void> {
    const position = await this.getPositionById(id);

    // Check if position has employees
    if (position.employees && position.employees.length > 0) {
      throw new BadRequestException('نمی‌توان سمت دارای پرسنل را حذف کرد');
    }

    await this.positionRepository.remove(position);
  }

  // Get organizational chart based on positions and employees
  async getOrganizationalChart(): Promise<any[]> {
    const positions = await this.positionRepository.find({
      relations: ['employees'],
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    // Filter out invalid positions
    const validPositions = positions.filter(pos => {
      if (!pos.id || typeof pos.id !== 'string' || pos.id.length !== 36) {
        console.error('Invalid position found in database for org chart:', pos);
        return false;
      }
      return true;
    });

    return this.buildOrgChart(validPositions);
  }

  private buildOrgChart(positions: Position[]): any[] {
    const positionMap = new Map<string, any>();

    // First pass: Create all position nodes
    positions.forEach(pos => {
      positionMap.set(pos.id, {
        id: pos.id,
        title: pos.title,
        description: pos.description,
        isAggregate: pos.isAggregate,
        x: pos.x,
        y: pos.y,
        parentPositionId: pos.parentPositionId,
        employees: (pos.employees || []).map(emp => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.role,
          employeeId: emp.employeeId,
          profileImageUrl: emp.profileImageUrl,
        })),
        children: []
      });
    });

    const roots: any[] = [];

    // Second pass: Build the tree
    positionMap.forEach(node => {
      if (node.parentPositionId && positionMap.has(node.parentPositionId)) {
        positionMap.get(node.parentPositionId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async updatePositionOrder(positionId: string, parentPositionId: string | null): Promise<Position> {
    // Validate positionId is a valid GUID
    if (!positionId || typeof positionId !== 'string' || positionId.length !== 36) {
      throw new BadRequestException('شناسه سمت نامعتبر است');
    }

    // Validate parentPositionId if provided
    if (parentPositionId !== null && (typeof parentPositionId !== 'string' || parentPositionId.length !== 36)) {
      throw new BadRequestException('شناسه سمت والد نامعتبر است');
    }

    console.log(`Updating position ${positionId} parent to ${parentPositionId}`);

    try {
      const result = await this.positionRepository.createQueryBuilder()
        .update(Position)
        .set({ parentPositionId: parentPositionId as any })
        .where("id = :id", { id: positionId })
        .execute();

      console.log('Update result:', result);
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }

    return this.getPositionById(positionId);
  }

  async updatePositionCoordinates(id: string, x: number | null, y: number | null): Promise<void> {
    await this.positionRepository.update(id, { x, y });
  }

  async getAllPositionsFlat(): Promise<Position[]> {
    const positions = await this.positionRepository.find({
      select: ['id', 'title', 'description', 'parentPositionId', 'order', 'isActive'],
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    // Filter out invalid positions
    const validPositions = positions.filter(pos => {
      if (!pos.id || typeof pos.id !== 'string' || pos.id.length !== 36) {
        console.error('Invalid position found in database:', pos);
        return false;
      }
      return true;
    });

    return validPositions;
  }
}
