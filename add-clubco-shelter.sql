-- Add Clubco Vlněna Brno to shelters database
-- Run this in Supabase SQL Editor or via your database admin interface

INSERT INTO shelters (
  id,
  name,
  description,
  type,
  latitude,
  longitude,
  elevation,
  capacity,
  is_free,
  is_serviced,
  accessibility,
  amenities,
  operator,
  opening_hours,
  access_type,
  seasonal,
  start_date,
  source,
  website,
  phone,
  email,
  address_house_number,
  address_street,
  address_place,
  address_city,
  address_postcode,
  amenity_type,
  shelter_type,
  tourism_type,
  building_type,
  building_material,
  material,
  building_levels,
  drinking_water,
  fireplace,
  stove,
  heating,
  bunks,
  mattress,
  bed,
  toilet,
  shower,
  indoor_seating,
  covered,
  reservation,
  image_url,
  wikidata,
  wikipedia
) VALUES (
  'clubco_vlnena_brno',
  'Clubco Vlněna Brno',
  'Coworkingové centrum v areálu Vlněna, moderní kancelářské prostory a eventový prostor v Brně.',
  'coworking',
  49.1908,
  16.6136,
  200,
  200,
  false,  -- fee=yes means it's not free
  true,   -- modern facility, likely serviced
  ARRAY['permissive'],
  ARRAY['drinking_water', 'heating', 'bunks', 'mattress', 'bed', 'toilet', 'shower', 'indoor_seating', 'covered'],
  'CTP Invest',
  'Mo-Fr 08:00-20:00; Sa-Su 10:00-18:00',
  'permissive',
  'all_seasons',
  '2019-01-01',
  'official',
  'https://www.clubco.cz/',
  '+420123456789',
  'info@clubco.cz',
  '5',
  'Přízova',
  'Vlněna',
  'Brno',
  '60200',
  'coworking',
  '',
  '',
  'office',
  'concrete',
  'glass',
  8,
  true,   -- drinking_water=yes
  false,  -- fireplace=no
  true,   -- stove=yes
  true,   -- heating=yes
  true,   -- bunks=yes
  true,   -- mattress=yes
  true,   -- bed=yes
  true,   -- toilet=yes
  true,   -- shower=yes
  true,   -- indoor_seating=yes
  true,   -- covered=yes
  'required',
  'https://www.clubco.cz/assets/img/clubco.jpg',
  'Q130893',
  'cs:Vlněna_(Brno)'
);

-- Verify the insert
SELECT * FROM shelters WHERE id = 'clubco_vlnena_brno';