\echo 'Delete and recreate foodie_love db?'
\prompt 'Return for yes or control-C to cancel > ' foo 

DROP DATABASE foodie_love; 
CREATE DATABASE foodie_love; 
\connect foodie_love

\i foodie-love-schema.sql
\i foodie-love-seed.sql

\echo 'Delete and recreate foodie_love_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo 

DROP DATABASE foodie_love_test;
CREATE DATABASE foodie_love_test;
\connect foodie_love_test;

\i foodie-love-schema.sql; 