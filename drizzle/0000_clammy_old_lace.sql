CREATE TABLE "app_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"ord" serial NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"lane" text NOT NULL,
	"owner" text NOT NULL,
	"due" text NOT NULL,
	"area" text NOT NULL,
	"source_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licensing_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"ord" serial NOT NULL,
	"step" text NOT NULL,
	"status" text NOT NULL,
	"owner" text NOT NULL,
	"source" text NOT NULL,
	"detail" text NOT NULL,
	"source_receipt_id" text
);
--> statement-breakpoint
CREATE TABLE "message_events" (
	"id" text PRIMARY KEY NOT NULL,
	"ord" serial NOT NULL,
	"direction" text NOT NULL,
	"channel" text NOT NULL,
	"sender" text NOT NULL,
	"text" text NOT NULL,
	"response" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"ord" serial NOT NULL,
	"source" text NOT NULL,
	"date" text NOT NULL,
	"area" text NOT NULL,
	"current_read" text NOT NULL,
	"confidence" text NOT NULL,
	"tone" text NOT NULL,
	"link" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"ord" serial NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"detail" text NOT NULL,
	"action" text NOT NULL,
	"tone" text NOT NULL,
	"icon_key" text NOT NULL,
	"updated_at" text NOT NULL
);
