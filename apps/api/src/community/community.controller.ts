import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CommunityService } from './community.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { ReactionDto } from './dto/reaction.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  findAll(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any
  ) {
    return this.communityService.findAll(category, req?.user?.id, Number(page) || 1, Number(limit) || 10);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  deletePost(@Request() req: any, @Param('id') postId: string) {
    return this.communityService.deletePost(req.user.id, postId, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  createPost(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.communityService.create(req.user.id, createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  createComment(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.communityService.createComment(req.user.id, postId, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/react')
  reactToPost(
    @Request() req: any, 
    @Param('id') postId: string,
    @Body() reactionDto: ReactionDto
  ) {
    return this.communityService.reactToPost(req.user.id, postId, reactionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:id/react')
  reactToComment(
    @Request() req: any,
    @Param('id') commentId: string,
    @Body() reactionDto: ReactionDto
  ) {
    return this.communityService.reactToComment(req.user.id, commentId, reactionDto);
  }
}
