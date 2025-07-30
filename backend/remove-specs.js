// MongoDB Shell Script to remove spec field (singular) from products
// Run this script using: mongosh --file remove-specs.js

// Connect to your database (replace 'your_database_name' with your actual database name)
use your_database_name

// Remove spec field (singular) from all products
db.products.updateMany(
  {},
  { $unset: { spec: "" } }
)

// Verify the update by checking a few documents
print("Updated products. Sample documents after update:")
db.products.find({}, {name: 1, spec: 1, specs: 1, _id: 0}).limit(3)

// Count total products
print("Total products in collection: " + db.products.countDocuments())

print("Script completed successfully!")