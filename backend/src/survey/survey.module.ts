import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Survey } from './entities/survey.entity';
import { Question } from './entities/question.entity';
import { Response } from './entities/response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, Question, Response, Comment])],
  controllers: [SurveyController, CommentController],
  providers: [SurveyService, CommentService],
  exports: [SurveyService, CommentService],
})
export class SurveyModule {}
