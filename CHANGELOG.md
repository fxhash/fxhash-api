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


## `listing` is now a polymorphic entity for both marketplace contracts

The entity `listing` encapsulates the 2 marketplace contracts, and so there are some colliding ids. To solve this issue, a new field was added to the listing, called `version`. The identifier of a listing is now defined by its `(id, version)` pair.


## Objkts no longer have a single `offer`

The indexer doesn't delete the offers anymore when cancelled/accepted, but instead it sets a `cancelledAt` / `acceptedAt` field to the moment when the action was performed. It's now possible to retreive the full history of an objkt listings.

The field `activeListing` was added to replace the behaviour of the previous `offer` field.


## `generativeToken { offers }` becomes `generativeToken { activeListedObjkts }` 

The endpoint was renamed because there used to be some inconsistency in the naming (it was called offers but it returned the objkts with active offers instead). The endpoint have the same features as before it was only renamed for clarity.


## Removed `generativeToken { latestObjkts }` 

It was removed as the feature is covered by `generativeToken { objkts }` with pagination.


## Removed `generativeToken { latestActions }`

It was removed as the feature is covered by `generativeToken { actions }` with pagination.