-- V2__seed_data.sql
-- Seed initial development data: Admin, Categories, Subcategories, 50+ Products, Inventory, Banners, Coupons, Delivery Areas

-- 1. Default Admin & Sample Customers
-- BCrypt hash for 'admin123': $2a$10$7EqJtq98hPqEX7fNZaFWoO.8/bT9F0X1oB7Cj6Gj0rV5S6g1h0N5y
INSERT INTO users (mobile_number, name, email, password_hash, role, profile_completed, active) VALUES
('9999999999', 'System Admin', 'admin@grocery.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/bT9F0X1oB7Cj6Gj0rV5S6g1h0N5y', 'ADMIN', TRUE, TRUE),
('9876543210', 'Rahul Sharma', 'rahul@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543211', 'Priya Patel', 'priya@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543212', 'Amit Verma', 'amit@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543213', 'Sneha Reddy', 'sneha@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543214', 'Vikram Singh', 'vikram@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543215', 'Ananya Roy', 'ananya@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543216', 'Kiran Kumar', 'kiran@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543217', 'Deepika Nair', 'deepika@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543218', 'Suresh Rao', 'suresh@example.com', NULL, 'CUSTOMER', TRUE, TRUE),
('9876543219', 'Neha Gupta', 'neha@example.com', NULL, 'CUSTOMER', TRUE, TRUE);

-- 2. Delivery Areas (Pincodes)
INSERT INTO delivery_areas (pincode, city, state, delivery_available, delivery_fee, minimum_order_amount) VALUES
('515001', 'Anantapur', 'Andhra Pradesh', TRUE, 15.00, 99.00),
('515002', 'Anantapur Rural', 'Andhra Pradesh', TRUE, 25.00, 149.00),
('560001', 'Bengaluru Central', 'Karnataka', TRUE, 25.00, 149.00),
('560034', 'Koramangala, Bengaluru', 'Karnataka', TRUE, 20.00, 99.00),
('500001', 'Hyderabad Central', 'Telangana', TRUE, 25.00, 149.00),
('500081', 'HITEC City, Hyderabad', 'Telangana', TRUE, 19.00, 99.00),
('110001', 'Connaught Place, New Delhi', 'Delhi', TRUE, 30.00, 199.00),
('400001', 'Fort, Mumbai', 'Maharashtra', TRUE, 30.00, 199.00);

-- 3. Categories
INSERT INTO categories (id, name, slug, description, image, display_order) VALUES
(1, 'Vegetables & Fruits', 'vegetables-fruits', 'Fresh organic farm-picked vegetables and juicy seasonal fruits', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80', 1),
(2, 'Dairy & Breakfast', 'dairy-breakfast', 'Farm milk, paneer, curd, butter, fresh bread, and morning cereal', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', 2),
(3, 'Munchies & Snacks', 'munchies-snacks', 'Crisps, nachos, popcorn, namkeen, roasted nuts, and party snacks', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80', 3),
(4, 'Cold Drinks & Juices', 'cold-drinks-juices', 'Refreshing sodas, iced teas, organic cold-pressed juices, and energy drinks', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80', 4),
(5, 'Instant & Frozen Food', 'instant-frozen-food', 'Noodles, ready-to-eat meals, frozen snacks, french fries, and momos', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80', 5),
(6, 'Bakery & Biscuits', 'bakery-biscuits', 'Artisanal cookies, whole wheat bread, cakes, buns, and gourmet rusks', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', 6),
(7, 'Atta, Rice & Dal', 'atta-rice-dal', 'Premium basmati rice, organic wheat flour, pulses, spices, and cooking oil', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', 7),
(8, 'Personal Care', 'personal-care', 'Soaps, body washes, skin lotions, haircare, and oral hygiene products', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80', 8),
(9, 'Household Essentials', 'household-essentials', 'Detergents, surface cleaners, garbage bags, dishwash, and fresh mops', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80', 9),
(10, 'Baby & Pet Care', 'baby-pet-care', 'Diapers, gentle wipes, organic baby food, puppy bites, and pet treats', 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=400&q=80', 10);

-- 4. Subcategories
INSERT INTO subcategories (id, category_id, name, slug, image, display_order) VALUES
(1, 1, 'Fresh Vegetables', 'fresh-vegetables', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=300&q=80', 1),
(2, 1, 'Fresh Fruits', 'fresh-fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80', 2),
(3, 2, 'Milk & Cream', 'milk-cream', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80', 1),
(4, 2, 'Paneer & Curd', 'paneer-curd', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80', 2),
(5, 3, 'Chips & Crisps', 'chips-crisps', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80', 1),
(6, 3, 'Namkeen & Mixtures', 'namkeen-mixtures', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80', 2),
(7, 4, 'Soft Drinks', 'soft-drinks', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80', 1),
(8, 4, 'Fruit Juices', 'fruit-juices', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=300&q=80', 2),
(9, 5, 'Instant Noodles', 'instant-noodles', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80', 1),
(10, 6, 'Bread & Buns', 'bread-buns', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80', 1),
(11, 7, 'Atta & Flours', 'atta-flours', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80', 1),
(12, 7, 'Rice & Grains', 'rice-grains', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=300&q=80', 2);

-- 5. 52 Seed Products
INSERT INTO products (id, category_id, subcategory_id, name, slug, description, brand, sku, price, mrp, discount_percentage, unit, quantity, stock_quantity, image, featured, active) VALUES
(1, 1, 1, 'Fresh Hybrid Tomato', 'fresh-hybrid-tomato-500g', 'Farm fresh, ripe red tomatoes perfect for Indian curries and fresh salads', 'FarmFresh', 'VEG-TOM-500', 22.00, 30.00, 26, 'pack', '500 g', 85, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(2, 1, 1, 'Fresh Red Onion', 'fresh-red-onion-1kg', 'Crisp and pungent red onions, kitchen daily essential', 'FarmFresh', 'VEG-ONI-1000', 38.00, 50.00, 24, 'pack', '1 kg', 120, 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(3, 1, 1, 'Fresh Potato (Aloo)', 'fresh-potato-1kg', 'Standard grade golden potatoes ideal for boiling, baking and frying', 'FarmFresh', 'VEG-POT-1000', 32.00, 42.00, 23, 'pack', '1 kg', 150, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(4, 1, 1, 'Fresh Coriander Bunch', 'fresh-coriander-100g', 'Fragrant green coriander leaves with fresh aroma', 'FarmFresh', 'VEG-COR-100', 12.00, 18.00, 33, 'bunch', '100 g', 75, 'https://images.unsplash.com/photo-1589135233689-d56799017637?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(5, 1, 2, 'Robusta Banana (Kela)', 'robusta-banana-6pcs', 'Sweet and energetic bananas rich in potassium', 'NatureGift', 'FRU-BAN-6', 36.00, 48.00, 25, 'pack', '6 pcs', 90, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(6, 1, 2, 'Shimla Crisp Apple', 'shimla-apple-4pcs', 'Sweet and crunchy apples freshly picked from Himachal orchards', 'HimachalOrchards', 'FRU-APP-4', 119.00, 160.00, 25, 'pack', '4 pcs (approx 550g)', 45, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(7, 1, 2, 'Nagpur Orange (Santra)', 'nagpur-orange-1kg', 'Juicy sweet-tangy oranges loaded with natural Vitamin C', 'NatureGift', 'FRU-ORG-1000', 79.00, 105.00, 24, 'pack', '1 kg', 40, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(8, 2, 3, 'Amul Taaza Homogenised Milk', 'amul-taaza-milk-500ml', 'Pasteurised toned milk with 3.0% fat, pure and healthy', 'Amul', 'DAI-AML-500', 27.00, 28.00, 3, 'pouch', '500 ml', 200, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(9, 2, 3, 'Amul Gold Full Cream Milk', 'amul-gold-milk-500ml', 'Rich full cream milk with 6.0% fat, perfect for tea, coffee & sweets', 'Amul', 'DAI-AMG-500', 33.00, 34.00, 2, 'pouch', '500 ml', 180, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(10, 2, 4, 'Amul Fresh Malai Paneer', 'amul-malai-paneer-200g', 'Soft and creamy cottage cheese cubes for delicious curries', 'Amul', 'DAI-AMP-200', 89.00, 95.00, 6, 'pack', '200 g', 65, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(11, 2, 4, 'Mother Dairy Classic Dahi (Curd)', 'mother-dairy-curd-400g', 'Thick and tasty pasteurised set curd rich in natural probiotics', 'Mother Dairy', 'DAI-MDC-400', 35.00, 38.00, 7, 'cup', '400 g', 95, 'https://images.unsplash.com/photo-1584278860047-22db9ff82bed?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(12, 2, 3, 'Amul Salted Butter', 'amul-butter-100g', 'Utterly butterly delicious creamy salted butter', 'Amul', 'DAI-AMB-100', 58.00, 60.00, 3, 'pack', '100 g', 110, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(13, 6, 10, 'Modern Whole Wheat Bread', 'modern-whole-wheat-bread-400g', 'High fiber nutritious whole wheat sandwich bread', 'Modern', 'BAK-BRD-400', 45.00, 50.00, 10, 'pack', '400 g', 55, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(14, 6, 10, 'Britannia White Bread', 'britannia-white-bread-400g', 'Soft sandwich white bread with goodness of wheat and milk', 'Britannia', 'BAK-BRT-400', 38.00, 42.00, 9, 'pack', '400 g', 60, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(15, 3, 5, 'Lay''s Magic Masala Potato Chips', 'lays-magic-masala-50g', 'Crispy ridged potato chips seasoned with Indian spices', 'Lays', 'SNK-LAY-50', 20.00, 20.00, 0, 'pouch', '50 g', 140, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(16, 3, 5, 'Lay''s American Style Cream & Onion', 'lays-cream-onion-50g', 'Crunchy sliced potato chips with smooth cream and green onion flavour', 'Lays', 'SNK-LAY-CO50', 20.00, 20.00, 0, 'pouch', '50 g', 130, 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(17, 3, 5, 'Kurkure Masala Munch', 'kurkure-masala-munch-80g', 'Tedha hai par mera hai! Iconic crunchy corn puffs with chatpata masala', 'Kurkure', 'SNK-KUR-80', 20.00, 20.00, 0, 'pouch', '80 g', 115, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(18, 3, 6, 'Haldiram''s Aloo Bhujia', 'haldirams-aloo-bhujia-200g', 'Spicy potato and mint noodles snack from Bikaner heritage', 'Haldirams', 'SNK-HAL-200', 52.00, 60.00, 13, 'pouch', '200 g', 80, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(19, 4, 7, 'Coca-Cola Can', 'coca-cola-can-300ml', 'The original refreshing cola drink served chilled', 'Coca-Cola', 'BEV-CC-300', 38.00, 40.00, 5, 'can', '300 ml', 160, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(20, 4, 7, 'Thums Up Charged Can', 'thums-up-can-300ml', 'Taste the thunder with intense carbonated cola rush', 'Thums Up', 'BEV-TU-300', 38.00, 40.00, 5, 'can', '300 ml', 150, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(21, 4, 7, 'Sprite Lemon Lime Can', 'sprite-can-300ml', 'Clear, crisp, and refreshing lemon-lime taste', 'Sprite', 'BEV-SPR-300', 38.00, 40.00, 5, 'can', '300 ml', 140, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(22, 4, 8, 'Real Fruit Power Mixed Fruit Juice', 'real-mixed-fruit-juice-1l', 'Rich blend of 9 handpicked fruits packed with natural vitamins', 'Real', 'BEV-REA-1000', 125.00, 140.00, 10, 'tetrapack', '1 L', 70, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(23, 5, 9, 'Maggi 2-Minute Masala Noodles (Pack of 4)', 'maggi-masala-noodles-4pack', 'India''s favorite noodles with authentic spice tastemaker', 'Nestle', 'INS-MAG-4P', 56.00, 60.00, 6, 'multipack', '4 x 70 g', 220, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(24, 5, 9, 'Top Ramen Curry Noodles', 'top-ramen-curry-noodles-280g', 'Smooth flat noodles loaded with spicy curry punch', 'Nissin', 'INS-NIS-280', 52.00, 58.00, 10, 'multipack', '280 g', 65, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(25, 7, 11, 'Aashirvaad Shudh Chakki Atta', 'aashirvaad-chakki-atta-5kg', '100% whole wheat grains ground for extra soft rotis', 'Aashirvaad', 'GRO-AAS-5000', 255.00, 290.00, 12, 'bag', '5 kg', 85, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(26, 7, 12, 'Daawat Rozana Super Basmati Rice', 'daawat-rozana-basmati-rice-5kg', 'Fluffy, long grain aromatic basmati rice for daily meals and biryani', 'Daawat', 'GRO-DAA-5000', 399.00, 475.00, 16, 'bag', '5 kg', 60, 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(27, 7, 11, 'Tata Salt Vacuum Evaporated Iodised', 'tata-salt-1kg', 'Desh ka namak with essential iodine for family health', 'Tata', 'GRO-TAT-1000', 26.00, 28.00, 7, 'pouch', '1 kg', 250, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(28, 7, 11, 'Fortune Sunlite Refined Sunflower Oil', 'fortune-sunflower-oil-1l', 'Light, healthy cooking oil enriched with Vitamins A, D & E', 'Fortune', 'GRO-FOR-1000', 135.00, 155.00, 12, 'pouch', '1 L', 100, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(29, 8, NULL, 'Dettol Original Germ Protection Soap (Pack of 3)', 'dettol-soap-pack-of-3', 'Clinically proven 100% better germ protection for skin hygiene', 'Dettol', 'PER-DET-3P', 145.00, 165.00, 12, 'multipack', '3 x 125 g', 90, 'https://images.unsplash.com/photo-1607602132700-068258431c6c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(30, 8, NULL, 'Colgate MaxFresh Spicy Red Gel Toothpaste', 'colgate-maxfresh-red-150g', 'Invigorating cooling crystals for intense breath freshness', 'Colgate', 'PER-COL-150', 99.00, 115.00, 13, 'tube', '150 g', 120, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(31, 9, NULL, 'Surf Excel Easy Wash Detergent Powder', 'surf-excel-easy-wash-1kg', 'Advanced stain removal technology that washes tough dirt with ease', 'Surf Excel', 'HOU-SUR-1000', 139.00, 150.00, 7, 'pouch', '1 kg', 80, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(32, 9, NULL, 'Vim Lemon Dishwash Gel', 'vim-dishwash-gel-750ml', 'Concentrated lemon gel with grease-cutting power for shiny utensils', 'Vim', 'HOU-VIM-750', 159.00, 180.00, 11, 'bottle', '750 ml', 95, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(33, 10, NULL, 'Pampers All Round Protection Baby Diaper Pants (M)', 'pampers-baby-diapers-medium-34', 'Ultra-absorbent magic gel diaper pants with 12 hours dryness', 'Pampers', 'BAB-PAM-34', 499.00, 599.00, 16, 'pack', '34 pcs', 40, 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(34, 10, NULL, 'Pedigree Adult Dry Dog Food (Meat & Rice)', 'pedigree-adult-dog-food-1-2kg', 'Nutritionally balanced meal for adult dogs with strong bones and coat shine', 'Pedigree', 'PET-PED-1200', 340.00, 370.00, 8, 'bag', '1.2 kg', 30, 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(35, 1, 1, 'Fresh Green Capsicum (Shimla Mirch)', 'fresh-capsicum-500g', 'Crisp bell peppers rich in antioxidants, great for stir fry and pizza', 'FarmFresh', 'VEG-CAP-500', 35.00, 48.00, 27, 'pack', '500 g', 60, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(36, 1, 1, 'Organic Palak (Spinach)', 'organic-palak-250g', 'Tender iron-rich green spinach leaves directly from local growers', 'FarmFresh', 'VEG-SPN-250', 20.00, 28.00, 28, 'bunch', '250 g', 70, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(37, 1, 2, 'Sweet Green Grapes (Angoor)', 'green-grapes-500g', 'Seedless juicy sweet table grapes', 'NatureGift', 'FRU-GRP-500', 65.00, 85.00, 23, 'box', '500 g', 45, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(38, 1, 2, 'Fresh Pomegranate (Anar)', 'fresh-pomegranate-4pcs', 'Ruby red juicy arils bursting with antioxidants', 'NatureGift', 'FRU-POM-4', 139.00, 180.00, 22, 'box', '4 pcs', 35, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(39, 2, 4, 'Epigamia Greek Yogurt (Wild Blueberry)', 'epigamia-greek-yogurt-blueberry', 'Zero preservative high protein Greek yogurt with real blueberries', 'Epigamia', 'DAI-EPI-90', 50.00, 55.00, 9, 'cup', '90 g', 40, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(40, 6, 10, 'Britannia Good Day Butter Cookies', 'good-day-butter-cookies-200g', 'Smile more with rich buttery crunch cookies', 'Britannia', 'BAK-GD-200', 35.00, 40.00, 12, 'pack', '200 g', 150, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(41, 6, 10, 'Oreo Original Vanilla Creme Cookies', 'oreo-vanilla-creme-120g', 'Twist, lick and dunk with classic cocoa cookies and vanilla cream', 'Cadbury', 'BAK-ORE-120', 35.00, 40.00, 12, 'pack', '120 g', 130, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(42, 3, 5, 'Doritos Cheese Supreme Nacho Chips', 'doritos-cheese-nacho-chips-100g', 'Crunchy triangular corn nachos packed with intense cheesy blast', 'Doritos', 'SNK-DOR-100', 50.00, 55.00, 9, 'pouch', '100 g', 80, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(43, 4, 7, 'Red Bull Energy Drink', 'red-bull-energy-drink-250ml', 'Vitalizes body and mind with caffeine, taurine and B-group vitamins', 'Red Bull', 'BEV-RB-250', 120.00, 125.00, 4, 'can', '250 ml', 90, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(44, 5, 9, 'McCain French Fries Crispy', 'mccain-french-fries-420g', 'Ready to fry golden potato strips with restaurant crunch', 'McCain', 'INS-MCC-420', 115.00, 135.00, 14, 'pack', '420 g', 50, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(45, 7, 12, 'Tata Sampann Unpolished Toor Dal', 'tata-sampann-toor-dal-1kg', 'Natural high protein toor dal without synthetic polish', 'Tata Sampann', 'GRO-TAT-TOOR1', 165.00, 185.00, 10, 'pouch', '1 kg', 90, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(46, 7, 11, 'Madhur Pure & Hygienic Sugar', 'madhur-pure-sugar-1kg', 'Sparkling white sulfur-free refined sugar crystals', 'Madhur', 'GRO-MAD-SUG1', 48.00, 55.00, 12, 'pouch', '1 kg', 140, 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(47, 8, NULL, 'Head & Shoulders Cool Menthol Anti-Dandruff Shampoo', 'head-and-shoulders-cool-menthol-180ml', 'Invigorating menthol freshness with up to 100% dandruff protection', 'Head & Shoulders', 'PER-HS-180', 170.00, 195.00, 12, 'bottle', '180 ml', 65, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(48, 9, NULL, 'Colin Glass and Surface Cleaner', 'colin-glass-cleaner-500ml', 'Streak-free shine on mirrors, glass tables, windows, and windshields', 'Colin', 'HOU-COL-500', 98.00, 110.00, 10, 'spray', '500 ml', 75, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(49, 1, 1, 'Fresh Green Cucumber (Kheera)', 'fresh-green-cucumber-500g', 'Cooling hydrating salad cucumbers crisp and juicy', 'FarmFresh', 'VEG-CUC-500', 25.00, 35.00, 28, 'pack', '500 g', 65, 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(50, 1, 1, 'Fresh Ginger (Adrak)', 'fresh-ginger-100g', 'Spicy aromatic root essential for authentic chai and tadka', 'FarmFresh', 'VEG-GIN-100', 18.00, 25.00, 28, 'pack', '100 g', 80, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', FALSE, TRUE),
(51, 2, 3, 'Amul Masti Spiced Buttermilk (Chaas)', 'amul-masti-buttermilk-200ml', 'Chilled spiced refreshing probiotic curd beverage', 'Amul', 'DAI-AMC-200', 15.00, 15.00, 0, 'tetrapack', '200 ml', 160, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', TRUE, TRUE),
(52, 3, 6, 'Nutraj California Almonds (Badam)', 'nutraj-california-almonds-200g', 'Premium crunchy protein-rich almonds for daily brain power', 'Nutraj', 'SNK-ALM-200', 199.00, 250.00, 20, 'pouch', '200 g', 75, 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80', TRUE, TRUE);

-- 6. Initialize Inventory for all products
INSERT INTO inventories (product_id, available_quantity, reserved_quantity)
SELECT id, stock_quantity, 0 FROM products;

-- 7. Promotional Banners
INSERT INTO banners (title, image, link, display_order, active) VALUES
('Super Fast 10-Minute Grocery Delivery', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80', '/category/vegetables-fruits', 1, TRUE),
('Daily Fresh Milk & Breakfast Delivered Daily at 6 AM', 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1200&q=80', '/category/dairy-breakfast', 2, TRUE),
('Weekend Snack Attack: Up to 30% Off Munchies', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1200&q=80', '/category/munchies-snacks', 3, TRUE),
('Staples & Kitchen Savings: Rice, Atta & Oil Mega Deals', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80', '/category/atta-rice-dal', 4, TRUE),
('Chill Out: Refreshing Cold Beverages & Mocktails', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80', '/category/cold-drinks-juices', 5, TRUE);

-- 8. Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount, start_date, expiry_date, usage_limit, times_used, active) VALUES
('WELCOME50', 'Get Flat ₹50 OFF on your first grocery order above ₹249', 'FIXED', 50.00, 249.00, 50.00, CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 180 DAY), 10000, 0, TRUE),
('BLINKIT100', 'Special ₹100 OFF on orders above ₹499', 'FIXED', 100.00, 499.00, 100.00, CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 180 DAY), 5000, 0, TRUE),
('SUPER20', 'Get 20% OFF on fresh fruits and vegetables up to ₹80', 'PERCENTAGE', 20.00, 199.00, 80.00, CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 180 DAY), 2000, 0, TRUE);

-- 9. Sample Addresses for Demo Customer (9876543210)
INSERT INTO addresses (user_id, address_line1, address_line2, landmark, city, state, pincode, address_type, is_default) VALUES
(2, 'Flat 402, Sai Residency', 'Court Road', 'Opposite Clock Tower', 'Anantapur', 'Andhra Pradesh', '515001', 'HOME', TRUE),
(2, 'Tech Hub, 2nd Floor', 'Subash Nagar', 'Near Collectorate', 'Anantapur', 'Andhra Pradesh', '515001', 'WORK', FALSE);
