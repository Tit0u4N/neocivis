CREATE TABLE "forum_user_moderations" (
	"city_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"muted" boolean DEFAULT false NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	CONSTRAINT "forum_user_moderations_city_id_user_id_pk" PRIMARY KEY("city_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "thread_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" text NOT NULL,
	"emoji" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer
);
--> statement-breakpoint
CREATE TABLE "thread_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"city_id" text NOT NULL,
	"author_id" integer NOT NULL,
	"body" text NOT NULL,
	"reactions" jsonb NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" text NOT NULL,
	"category_id" text NOT NULL,
	"author_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "thread_messages" ADD CONSTRAINT "thread_messages_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "threads" ADD CONSTRAINT "threads_category_id_thread_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."thread_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forum_user_moderations_city_id_idx" ON "forum_user_moderations" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "thread_categories_city_id_idx" ON "thread_categories" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "thread_messages_thread_id_idx" ON "thread_messages" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "threads_city_id_idx" ON "threads" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "threads_city_id_category_id_idx" ON "threads" USING btree ("city_id","category_id");