CREATE TABLE recipes (
    id SERIAL PRIMARY KEY, 
    recipe_name TEXT NOT NULL, 
    prep_time INTEGER,
    cooking_time INTEGER,
    recipe_image TEXT,
    instructions TEXT, 
    meal_type TEXT
);

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY, 
    ingredient_name TEXT
);

CREATE TABLE measurement_units (
    id SERIAL PRIMARY KEY, 
    measurement_description TEXT
);

CREATE TABLE recipe_ingredients (
    recipe_id INTEGER
        REFERENCES recipes ON DELETE CASCADE, 
    measurement_id INTEGER
        REFERENCES measurement_units ON DELETE CASCADE,
    ingredient_id INTEGER
        REFERENCES ingredients ON DELETE CASCADE,
    amount NUMERIC, 
    PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  image_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users_recipes (
    username VARCHAR(25) 
        REFERENCES users ON DELETE CASCADE, 
    recipe_id INTEGER 
        REFERENCES recipes ON DELETE CASCADE,
    PRIMARY KEY (username, recipe_id)
);

CREATE TABLE users_groceries (
    username VARCHAR(25)
        REFERENCES users ON DELETE CASCADE,
    ingredient_id INTEGER
        REFERENCES ingredients ON DELETE CASCADE,
    PRIMARY KEY (username, ingredient_id)
);


