CHANGELOG
=======

> This file will be used to keep track of the changes made to the API to inform the consumers about what they need to update in their applications.


# (TO DELETE) Migration strategy

* transfer the new schema
* adapt the codebase so that old methods can cover the new schema
* add all the required entrypoints to cover the new schema
* add the new entities to the API
* optimize where it's possible
* test properly


# Changelog

## API self documentation

Most of the API endpoints / properties are now properly documented, which should make its usage easier.

## `offer` => `listing`

Fxhash used to call its listings `OFFERS`, which used to create a lot of confusion for the ecosystem. All the endpoints and keywords related to was used to be called offers were renamed into listings.