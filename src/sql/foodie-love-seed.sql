INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin',
        'dbenson3091@gmail.com',
        TRUE);

INSERT INTO recipes (recipe_name, prep_time, cooking_time, recipe_image, instructions, meal_type)
VALUES (
       'lemon tahini quinoa salad', 
       5, 
       25, 
       NULL, 
       '[
              {"instruction": "Heat 2 cups water and quinoa until boiling in medium saucepan over high heat, reduce heat to medium-low and simmer until water is absorbed and quinoa fluffs up, about 15 minutes. Quinoa is done when it is tender and there is a pop to each bite. Drain water and place quinoa in mixing bowl"}, 
              {"instruction": "Add onion, broccoli, peppers, tomoatoes, and chickpeas"}, 
              {"instruction": "To make the sauce, whisk together all the ingredients"}, 
              {"instruction": "Add the sauce to the cooked quinoa and vegetables"}, 
              {"instruction": "Serve garnished with a bit of cilantro"}
       ]', 
       'vegan'),
       (
       'savory spaghetti squash', 
       25, 
       45, 
       NULL, 
       '
       [
              {"instruction": "Preheat oven to 350°F"}, 
              {"instruction": "Cut squash lengthwise and clean out seeds. Place squash cut sides down on a nonstick baking sheet. Bake for 45 minutes or until the squash is easily pierced with a sharp knife. Remove squash from oven and set aside to cool enough to be easily handled"},{"instruction": "While squash is baking, sauté onion and garlic with 2 tablespoons vegetable broth in a medium-sized skillet over medium heat until onion is soft. Add remaining vegetable broth, tomatoes, pepper, spices, and lemon juice. Cook for 5-8 minutes. Season with salt and pepper. Set aside."},
              {"instruction": "Using a fork, gently pull the strands of squash away from the peel. Place the strands onto a large serving bowl"},
              {"instruction": "Add tomato mixture to squash and mix gently. Serve warm"}
       ]', 
       'vegan');

INSERT INTO ingredients (ingredient_name)
VALUES ('spaghetti squash'), ('vegetable broth'), ('onion'), ('cloves garlic'), 
       ('diced fresh tomatoes'), ('green pepper'), ('rosemary'), ('oregano'), 
       ('basil'), ('red pepper flakes'), ('thyme'), ('majoram'), ('lemon juice'), 
       ('water'), ('quinoa'), ('red onion'), ('broccoli'), ('red bell pepper'), 
       ('yellow pepper'), ('tomatoes'), ('can chickpeas'), ('tahini'), 
       ('lemon juice'), ('hot water'), ('tamari'), ('sweetener'), 
       ('powdered garlic');

INSERT INTO measurement_units (measurement_description) 
VALUES ('cup'), ('grams'), ('tablespoon'), ('teaspoon'), ('pint'), 
       ('liter'), ('quart');
       
INSERT INTO recipe_ingredients (recipe_id, measurement_id, ingredient_id, amount)
VALUES (1, 1, 14, 2.0 ), (1, 1, 15, 1.0), (1, NULL, 16, 0.5), (1, 1, 17, 1.0), 
       (1, NULL, 18, 1.0), (1, NULL, 19, 1.0), (1, NULL, 20, 2.0), 
       (1, NULL, 21, 1.0), (1, 1, 22, 0.25), (1, 3, 23, 3.0), (1, 3, 24, 2.0), 
       (1, 3, 25, 2.0), (1, 3, 26, 2.0), (1, 4, 27, 1.0), (2, NULL, 1, 1.0), 
       (2, 1, 2, 0.25), (2, NULL, 3, 1.0), (2, NULL, 4, 3.0), (2, 1, 5, 4.0), 
       (2, NULL, 6, 1.0), (2, 4, 7, 1.0), (2, 4, 8, 1.0), (2, 4, 9, 1.0), 
       (2, 4, 10, 0.5), (2, 4, 11, 0.5), (2, 4, 12, 0.5), (2, 3, 13, 1.0);

//clo28apk0000hohogcnjnlxp4  clo28d8lu000iohogxa0g1qop