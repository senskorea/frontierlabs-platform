CREATE TABLE `channel_gateway_bindings` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`gateway_id` text NOT NULL,
	`bound_by_user_id` text NOT NULL,
	`bound_at` text NOT NULL,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gateway_id`) REFERENCES `gateway_resources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bound_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `idx_channel_gateway_bindings_gateway_id` ON `channel_gateway_bindings` (`gateway_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `channel_gateway_bindings_channel_idx` ON `channel_gateway_bindings` (`channel_id`);--> statement-breakpoint
CREATE TABLE `channel_members` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`last_x` integer,
	`last_y` integer,
	`joined_at` text,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_channel_members_channel_id` ON `channel_members` (`channel_id`);--> statement-breakpoint
CREATE INDEX `idx_channel_members_user_id` ON `channel_members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `channel_members_channel_user_unique` ON `channel_members` (`channel_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`owner_id` text NOT NULL,
	`group_id` text,
	`map_data` text,
	`map_config` text,
	`is_public` integer DEFAULT true,
	`invite_code` text,
	`max_players` integer DEFAULT 50,
	`password` text,
	`gateway_config` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channels_invite_code_unique` ON `channels` (`invite_code`);--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`appearance` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_characters_user_id` ON `characters` (`user_id`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`npc_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`npc_id`) REFERENCES `npcs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_chat_messages_lookup` ON `chat_messages` (`character_id`,`npc_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `gateway_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`base_url` text NOT NULL,
	`token_encrypted` text NOT NULL,
	`paired_device_id` text,
	`last_validated_at` text,
	`last_validation_status` text,
	`last_validation_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_gateway_resources_owner_user_id` ON `gateway_resources` (`owner_user_id`);--> statement-breakpoint
CREATE TABLE `gateway_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`gateway_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'use' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`gateway_id`) REFERENCES `gateway_resources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_gateway_shares_gateway_id` ON `gateway_shares` (`gateway_id`);--> statement-breakpoint
CREATE INDEX `idx_gateway_shares_user_id` ON `gateway_shares` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `gateway_shares_gateway_user_idx` ON `gateway_shares` (`gateway_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `group_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`token` text NOT NULL,
	`created_by` text NOT NULL,
	`target_user_id` text,
	`target_login_id` text,
	`expires_at` text,
	`accepted_by` text,
	`accepted_at` text,
	`revoked_at` text,
	`created_at` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`accepted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_invites_token_unique` ON `group_invites` (`token`);--> statement-breakpoint
CREATE INDEX `idx_group_invites_group_id` ON `group_invites` (`group_id`);--> statement-breakpoint
CREATE INDEX `idx_group_invites_target_user_id` ON `group_invites` (`target_user_id`);--> statement-breakpoint
CREATE TABLE `group_join_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_group_join_requests_group_id` ON `group_join_requests` (`group_id`);--> statement-breakpoint
CREATE INDEX `idx_group_join_requests_user_id` ON `group_join_requests` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_join_requests_group_user_unique` ON `group_join_requests` (`group_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`approved_by` text,
	`approved_at` text,
	`joined_at` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_group_members_group_id` ON `group_members` (`group_id`);--> statement-breakpoint
CREATE INDEX `idx_group_members_user_id` ON `group_members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_members_group_user_unique` ON `group_members` (`group_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `group_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`permission_key` text NOT NULL,
	`effect` text NOT NULL,
	`created_by` text,
	`created_at` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_group_permissions_group_id` ON `group_permissions` (`group_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_permissions_group_permission_unique` ON `group_permissions` (`group_id`,`permission_key`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_by` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_slug_unique` ON `groups` (`slug`);--> statement-breakpoint
CREATE TABLE `map_portals` (
	`id` text PRIMARY KEY NOT NULL,
	`from_map_id` text,
	`to_map_id` text,
	`from_x` integer NOT NULL,
	`from_y` integer NOT NULL,
	`to_x` integer NOT NULL,
	`to_y` integer NOT NULL,
	FOREIGN KEY (`from_map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_map_id`) REFERENCES `maps`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `map_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT '🗺️' NOT NULL,
	`description` text,
	`cols` integer NOT NULL,
	`rows` integer NOT NULL,
	`layers` text,
	`objects` text,
	`tiled_json` text,
	`thumbnail` text,
	`spawn_col` integer NOT NULL,
	`spawn_row` integer NOT NULL,
	`tags` text,
	`created_by` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `maps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tilemap_path` text NOT NULL,
	`config` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `meeting_minutes` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`topic` text NOT NULL,
	`transcript` text NOT NULL,
	`participants` text DEFAULT '[]' NOT NULL,
	`total_turns` integer DEFAULT 0 NOT NULL,
	`duration_seconds` integer,
	`initiator_id` text,
	`key_topics` text DEFAULT '[]' NOT NULL,
	`conclusions` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`initiator_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_meeting_minutes_channel` ON `meeting_minutes` (`channel_id`);--> statement-breakpoint
CREATE INDEX `idx_meeting_minutes_created` ON `meeting_minutes` (`created_at`);--> statement-breakpoint
CREATE TABLE `npc_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`npc_id` text NOT NULL,
	`task_id` text NOT NULL,
	`target_user_id` text NOT NULL,
	`kind` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`delivered_at` text,
	`consumed_at` text,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`npc_id`) REFERENCES `npcs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `npc_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`npc_id` text NOT NULL,
	`user_id` text NOT NULL,
	`adapter_type` text NOT NULL,
	`session_type` text NOT NULL,
	`session_ref` text NOT NULL,
	`context_key` text NOT NULL,
	`last_summary` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`npc_id`) REFERENCES `npcs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_npc_sessions_npc` ON `npc_sessions` (`npc_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `npc_sessions_npc_user_context_idx` ON `npc_sessions` (`npc_id`,`user_id`,`context_key`);--> statement-breakpoint
CREATE TABLE `npcs` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`name` text NOT NULL,
	`position_x` integer NOT NULL,
	`position_y` integer NOT NULL,
	`direction` text DEFAULT 'down',
	`appearance` text NOT NULL,
	`openclaw_config` text NOT NULL,
	`adapter_type` text DEFAULT 'openclaw' NOT NULL,
	`adapter_config` text,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_npcs_channel_id` ON `npcs` (`channel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `npcs_channel_position_unique` ON `npcs` (`channel_id`,`position_x`,`position_y`);--> statement-breakpoint
CREATE TABLE `project_stamps` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`stamp_id` text NOT NULL,
	`added_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`stamp_id`) REFERENCES `stamps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_project_stamp` ON `project_stamps` (`project_id`,`stamp_id`);--> statement-breakpoint
CREATE TABLE `project_tilesets` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`tileset_id` text NOT NULL,
	`firstgid` integer NOT NULL,
	`added_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tileset_id`) REFERENCES `tileset_images`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_project_tileset` ON `project_tilesets` (`project_id`,`tileset_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`thumbnail` text,
	`tiled_json` text,
	`settings` text,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `provider_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`provider_type` text NOT NULL,
	`display_name` text,
	`auth_method` text NOT NULL,
	`credentials_encrypted` text,
	`base_url` text,
	`last_validated_at` text,
	`last_validation_status` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_provider_resources_owner` ON `provider_resources` (`owner_user_id`);--> statement-breakpoint
CREATE TABLE `provider_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'use' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `provider_resources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_provider_shares_provider` ON `provider_shares` (`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `provider_shares_provider_user_idx` ON `provider_shares` (`provider_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `stamps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`cols` integer NOT NULL,
	`rows` integer NOT NULL,
	`tile_width` integer DEFAULT 32 NOT NULL,
	`tile_height` integer DEFAULT 32 NOT NULL,
	`layers` text NOT NULL,
	`tilesets` text NOT NULL,
	`thumbnail` text,
	`created_by` text,
	`built_in` integer DEFAULT false NOT NULL,
	`tags` text,
	`created_at` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`npc_id` text,
	`assigner_id` text NOT NULL,
	`npc_task_id` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`auto_nudge_count` integer DEFAULT 0 NOT NULL,
	`auto_nudge_max` integer DEFAULT 5 NOT NULL,
	`last_nudged_at` text,
	`last_reported_at` text,
	`stalled_at` text,
	`stalled_reason` text,
	`created_at` text,
	`updated_at` text,
	`completed_at` text,
	FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`npc_id`) REFERENCES `npcs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigner_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_channel` ON `tasks` (`channel_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_npc` ON `tasks` (`npc_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tasks_npc_task_id` ON `tasks` (`npc_id`,`npc_task_id`);--> statement-breakpoint
CREATE TABLE `tileset_images` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tilewidth` integer DEFAULT 32 NOT NULL,
	`tileheight` integer DEFAULT 32 NOT NULL,
	`columns` integer NOT NULL,
	`tilecount` integer NOT NULL,
	`image` text NOT NULL,
	`built_in` integer DEFAULT false NOT NULL,
	`tags` text,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tileset_images_name` ON `tileset_images` (`name`);--> statement-breakpoint
CREATE TABLE `user_permission_overrides` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	`permission_key` text NOT NULL,
	`effect` text NOT NULL,
	`created_by` text,
	`created_at` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_user_permission_overrides_group_id` ON `user_permission_overrides` (`group_id`);--> statement-breakpoint
CREATE INDEX `idx_user_permission_overrides_user_id` ON `user_permission_overrides` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_permission_overrides_group_user_permission_unique` ON `user_permission_overrides` (`group_id`,`user_id`,`permission_key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`login_id` text NOT NULL,
	`nickname` text NOT NULL,
	`password_hash` text NOT NULL,
	`system_role` text DEFAULT 'user' NOT NULL,
	`last_active_at` text,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_login_id_unique` ON `users` (`login_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `users` (`nickname`);