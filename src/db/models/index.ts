import { Sequelize } from 'sequelize';
import User, { initUser } from './User.js';
import Channel, { initChannel } from './Channel.js';
import ChannelMember, { initChannelMember } from './ChannelMember.js';
import ChannelInvite, { initChannelInvite } from './ChannelInvite.js';
import Group, { initGroup } from './Group.js';
import GroupMember, { initGroupMember } from './GroupMember.js';
import Post, { initPost } from './Post.js';
import Comment, { initComment } from './Comment.js';
import PostReaction, { initPostReaction } from './PostReaction.js';
import DMConversation, { initDMConversation } from './DMConversation.js';
import DMParticipant, { initDMParticipant } from './DMParticipant.js';
import DMMessage, { initDMMessage } from './DMMessage.js';
import Notification, { initNotification } from './Notification.js';
import PushToken, { initPushToken } from './push-token.js';

export {
  User,
  Channel,
  ChannelMember,
  ChannelInvite,
  Group,
  GroupMember,
  Post,
  Comment,
  PostReaction,
  DMConversation,
  DMParticipant,
  DMMessage,
  Notification,
  PushToken
};

export const initializeModels = (sequelize: Sequelize) => {
  // Initialize all models
  initUser(sequelize);
  initChannel(sequelize);
  initChannelMember(sequelize);
  initChannelInvite(sequelize);
  initGroup(sequelize);
  initGroupMember(sequelize);
  initPost(sequelize);
  initComment(sequelize);
  initPostReaction(sequelize);
  initDMConversation(sequelize);
  initDMParticipant(sequelize);
  initDMMessage(sequelize);
  initNotification(sequelize);
  initPushToken(sequelize);
  // Define associations based on specification

  // User associations
  User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
  User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
  User.hasMany(PushToken, { foreignKey: 'userId', as: 'pushTokens'});

  // Channel associations
  Channel.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Channel.belongsToMany(User, { through: ChannelMember, foreignKey: 'channelId', otherKey: 'userId' });
  Channel.hasMany(ChannelMember, { foreignKey: 'channelId', as: 'channel_members' }); // Added for includes
  Channel.hasMany(Post, { foreignKey: 'channelId' });

  // Group associations
  Group.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId', otherKey: 'userId' });
  Group.hasMany(GroupMember, { foreignKey: 'groupId', as: 'group_members' }); // Added for includes
  Group.hasMany(Post, { foreignKey: 'groupId' });

  // Post associations
  Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
  Post.belongsTo(Channel, { foreignKey: 'channelId' });
  Post.belongsTo(Group, { foreignKey: 'groupId' });
  Post.hasMany(Comment, { foreignKey: 'postId' });
  Post.hasMany(PostReaction, { foreignKey: 'postId' });

  // Direct message associations
  DMConversation.hasMany(DMMessage, { foreignKey: 'conversationId', as: 'messages' });
  DMConversation.hasMany(DMParticipant, { foreignKey: 'conversationId', as: 'participants' });
  DMConversation.belongsToMany(User, { through: DMParticipant, foreignKey: 'conversationId', otherKey: 'userId' });

  // Supporting associations (for join tables and related data)
  ChannelMember.belongsTo(Channel, { foreignKey: 'channelId' });
  ChannelMember.belongsTo(User, { foreignKey: 'userId' });

  // ChannelInvite associations
  ChannelInvite.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });
  ChannelInvite.belongsTo(User, { foreignKey: 'invitedUserId', as: 'invitedUser' });
  ChannelInvite.belongsTo(User, { foreignKey: 'invitedBy', as: 'inviter' });

  GroupMember.belongsTo(Group, { foreignKey: 'groupId' });
  GroupMember.belongsTo(User, { foreignKey: 'userId' });

  Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

  PostReaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  DMMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

  DMParticipant.belongsTo(User, { foreignKey: 'userId' });
  DMParticipant.belongsTo(DMConversation, { foreignKey: 'conversationId' });

  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  PushToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

};
