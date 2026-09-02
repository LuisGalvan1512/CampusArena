import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CommunityService } from './community.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { ReactionDto } from './dto/reaction.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  findAll(@Query('category') category?: string, @Request() req?: any) {
    // If we want to get the user ID from token without throwing an error if absent,
    // we would need an OptionalJwtGuard, but for now we'll just check if req.user exists.
    return this.communityService.findAll(category, req?.user?.id);
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
}
