CREATE TABLE "cities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"admin_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "city_citizens" (
	"city_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "city_citizens_city_id_user_id_pk" PRIMARY KEY("city_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "city_employees" (
	"city_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "city_employees_city_id_user_id_pk" PRIMARY KEY("city_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_citizens" ADD CONSTRAINT "city_citizens_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_citizens" ADD CONSTRAINT "city_citizens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_employees" ADD CONSTRAINT "city_employees_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_employees" ADD CONSTRAINT "city_employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cities_admin_user_id_uniq" ON "cities" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "cities_name_idx" ON "cities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "city_citizens_city_id_idx" ON "city_citizens" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "city_citizens_user_id_idx" ON "city_citizens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "city_employees_user_id_uniq" ON "city_employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "city_employees_city_id_idx" ON "city_employees" USING btree ("city_id");