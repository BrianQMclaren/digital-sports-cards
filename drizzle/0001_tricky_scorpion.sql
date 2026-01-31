CREATE TABLE "cardsTable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"player_id" integer,
	"buy_price" double precision NOT NULL,
	"minted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playersTable" (
	"id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"sport" text NOT NULL,
	"ppg" double precision DEFAULT 0,
	"rpg" double precision DEFAULT 0,
	"apg" double precision DEFAULT 0,
	"spg" double precision DEFAULT 0,
	"games_played" integer DEFAULT 0,
	"current_price" double precision DEFAULT 0,
	"latest_insight" text,
	"performance_context" jsonb,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usersTable" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"username" text NOT NULL,
	"virtual_balance" double precision DEFAULT 1000,
	"created_at" timestamp DEFAULT now(),
	"last_login" timestamp,
	CONSTRAINT "usersTable_email_unique" UNIQUE("email"),
	CONSTRAINT "usersTable_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DROP TABLE "accounts" CASCADE;--> statement-breakpoint
DROP TABLE "cards" CASCADE;--> statement-breakpoint
DROP TABLE "players" CASCADE;--> statement-breakpoint
DROP TABLE "profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "cardsTable" ADD CONSTRAINT "cardsTable_user_id_usersTable_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usersTable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cardsTable" ADD CONSTRAINT "cardsTable_player_id_playersTable_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."playersTable"("id") ON DELETE no action ON UPDATE no action;