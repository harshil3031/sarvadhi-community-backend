import { Comment, Post, User } from '../db/models/index.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import notificationService, { NotificationType } from './notification.service.js';

/**
 * Create a comment on a post
 */
const createComment = async (
  postId: string,
  authorId: string,
  content: string
): Promise<any> => {
  // Verify post exists and is not deleted
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  // Verify author exists
  const author = await User.findByPk(authorId);
  if (!author) {
    throw new ValidationError('Author user not found');
  }

  // Create comment
  const comment = await Comment.create({
    postId,
    authorId,
    content,
    isDeleted: false
  });

  // 🔔 Notify post author
  if (post.authorId !== authorId) {
    try {
      await notificationService.createNotification(
        post.authorId,
        NotificationType.POST_COMMENT,
        postId,
        author
      );
    } catch (err) {
      console.error('Failed to create notification for comment:', err);
    }
  }

  return formatCommentResponse(comment);
};

/**
 * Get all comments for a post
 */
const getComments = async (postId: string): Promise<any[]> => {
  // Verify post exists
  const post = await Post.findByPk(postId);

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.isDeleted) {
    throw new NotFoundError('Post has been deleted');
  }

  // Get non-deleted comments for this post
  const comments = await Comment.findAll({
    where: {
      postId,
      isDeleted: false
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email', 'profilePhotoUrl']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  return comments.map(formatCommentResponse);
};

/**
 * Delete a comment (author only)
 */
const deleteComment = async (commentId: string, userId: string): Promise<void> => {
  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.isDeleted) {
    throw new NotFoundError('Comment has been deleted');
  }

  // Only author can delete
  if (comment.authorId !== userId) {
    throw new ForbiddenError('You do not have permission to delete this comment');
  }

  // Soft delete
  comment.isDeleted = true;
  await comment.save();
};

/**
 * Get comments for a post (alias for getComments)
 */
const getCommentsForPost = getComments;

/**
 * Update a comment (author only)
 */
const updateComment = async (
  commentId: string,
  userId: string,
  content: string
): Promise<any> => {
  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.isDeleted) {
    throw new NotFoundError('Comment has been deleted');
  }

  // Only author can update
  if (comment.authorId !== userId) {
    throw new ForbiddenError('You do not have permission to update this comment');
  }

  comment.content = content;
  await comment.save();

  return formatCommentResponse(comment);
};

/**
 * Format comment response
 */
const formatCommentResponse = (comment: Comment): any => {
  const author = (comment as any).author;
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    author: author ? {
      id: author.id,
      fullName: author.fullName,
      email: author.email,
      avatar: author.profilePhotoUrl
    } : null,
    content: comment.content,
    isDeleted: comment.isDeleted,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt || comment.createdAt
  };
};

export default {
  createComment,
  getComments,
  getCommentsForPost,
  updateComment,
  deleteComment
};
