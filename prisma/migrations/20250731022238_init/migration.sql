-- CreateEnum
CREATE TYPE "public"."application_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."creator_applications" (
    "id" SERIAL NOT NULL,
    "wallet_address" VARCHAR(66) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "professional_title" VARCHAR(255),
    "linkedin_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "verification_docs" TEXT[],
    "status" "public"."application_status" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_applications_wallet_address_key" ON "public"."creator_applications"("wallet_address");
