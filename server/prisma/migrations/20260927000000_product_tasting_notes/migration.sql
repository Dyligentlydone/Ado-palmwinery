-- Product tasting notes and specifications
ALTER TABLE "products"
  ADD COLUMN "abv" DECIMAL(4,1),
  ADD COLUMN "volumeMl" INTEGER,
  ADD COLUMN "nose" TEXT,
  ADD COLUMN "noseEs" TEXT,
  ADD COLUMN "palate" TEXT,
  ADD COLUMN "palateEs" TEXT,
  ADD COLUMN "finish" TEXT,
  ADD COLUMN "finishEs" TEXT;
