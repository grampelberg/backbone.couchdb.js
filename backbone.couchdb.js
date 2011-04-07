/**
 * @author: Thomas Rampelberg <thomas@saunter.org>
 *
 * Copyright(c) 2011 Thomas Rampelberg
 */

(function($) {

  Backbone.couch = {};
  Backbone.couch.options = {
    database: 'test',
    design: 'backbone'
  };

  var couch = {
    model: {
      create: function(_db, model, cb) {
        _db.saveDoc(model.toJSON(), {
          success: cb.success,
          error: cb.error
        });
      },
      update: function(_db, model, cb) {
        this.create(_db, model, cb);
      },
      read: function(_db, model, cb) {
        _db.openDoc(model.id, {
          success: cb.success,
          error: cb.error
        });
      },
      'delete': function(_db, model, cb) {
        _db.removeDoc(model.toJSON(), {
          success: cb.success,
          error: cb.error
        });
      }
    },
    collection: {
      read: function(_db, model, cb) {
        var opts = model.couch();
        if (!('view' in opts))
          throw new Error("The return of `couch()` must contain the view");
        var query = opts.design || Backbone.couch.options.design + '/' +
          opts.view;
        delete opts.view;
        _db.view(query, _.extend({
          success: function(resp) {
            cb.success(_.map(resp.rows, function(row, k) {
              _.extend(row, row.value, row.doc);
              if (!row.id && row._id) row.id = row._id;
              delete row._id;
              if (!row.id) row.id = k;
              return row;
            }));
          },
          error: cb.error
        }, opts));
      }
    },
    sync: function(method, model, cb) {
      // XXX - This is going to be a memory issue unless someone does the
      // extend trick.
      if (!this._db) this._db = $.couch.db(Backbone.couch.options.database);
      var type = 'model' in model ? 'collection' : 'model';
      couch[type][method](this._db, model, cb);
    }
  };

  Backbone.couch.Model = Backbone.Model.extend({
    sync: couch.sync
  });

  Backbone.couch.Collection = Backbone.Collection.extend({
    sync: couch.sync
  });

})(jQuery);
