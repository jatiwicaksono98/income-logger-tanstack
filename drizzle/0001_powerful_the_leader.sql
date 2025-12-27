CREATE TABLE "daily_records" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"transfer_amount" integer DEFAULT 0 NOT NULL,
	"afternoon_shift_amount" integer DEFAULT 0 NOT NULL,
	"night_shift_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_record_userId_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_record_userId_idx" ON "daily_records" USING btree ("user_id");