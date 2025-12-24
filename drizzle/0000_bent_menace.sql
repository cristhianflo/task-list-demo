CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (uuid()),
	`cognito_sub` varchar(255),
	`email` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
