# Getting started

First, you'll need to include some new script tags on your pages:

    <script src="underscore.js"></script>
    <script src="jquery.js"></script>
    <script src="jquery.couch.js"></script>
    <script src="backbone.js"></script>
    <script src="backbone.couchdb.js"></script>

## Models

There's nothing that you'll need to do to make this work with models. The model
id is going to be used to fetch/save the model and it will just work.

## Collections

For collections, there's some extra configuration required:

    Backbone.couch.Collection.extend({
        couch: function() {
            return {
                view: 'design/my_view'
            }
        },
        _db: Backbone.couch.db('my_database')
    })

The couch function needs to return options to query the db with. In this
example, The results of
`http://localhost:5984/my_database/_design/my_design_document/_view/my_view`
will be added to the collection (with each row being a separate model).

For a lot of views, it makes sense to have them look something like this:

    emit(key, null);

This ends up saving disk space if you're just using the raw document (as it can
be fetched with the include_docs query parameter). If you'd like to do this
trick here:

    { view: 'design/my_view',
      include_docs: 'true'
    }

Note that the couch function can return just about any query parameter. I find
it especially useful for limiting the collection size and using startKey/endKey.

## _changes

To get the changes feed working, you need to enable it in your model.

    Backbone.couch.Collection.extend({
        change_feed: true
    })

This is going to try and add everything on changes to your collection (which
probably isn't the most desirable thing). To add filtering, so that the
collection only sees updates for the specific thing it tracks, you can add a
key to the `couch()` method.

    Backbone.couch.Collection.extend({
        change_feed: true,
        couch: function() {
            return {
                filter: {
                    filter: 'design/my_filter',
                    /* query parameters */
                    test: 'foobar'
                }
            }
        }
    })

## Update handlers

It is possible to use an update handler for all model create/updates. Just add
the handler you'd like to use to the return value of couch():

    Backbone.couch.Collection.extend({
        couch: function() {
            return {
                view: 'design/my_view',
                update: 'design/my_update'
            }
        }
    })

# TODOs

- Take some time to explain a little more of why this is useful.
- Do an example of the relationship between documents in the DB and models in
  the client.
- Add some couchapp steps to show the setup in couchapp itself.
- Show some more view options in the couch() method as examples.
- Move best practice suggestion for views to a footnote.
