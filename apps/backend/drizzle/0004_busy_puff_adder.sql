CREATE TABLE "establishments" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"address" text NOT NULL,
	"hours" text NOT NULL,
	"phone" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
ALTER TABLE "establishments" ADD CONSTRAINT "establishments_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "establishments_city_id_idx" ON "establishments" USING btree ("city_id");