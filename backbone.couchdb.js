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
    _db: null,
    model: {
      create: function(model, success, error) {
        couch._db.saveDoc(model.toJSON(), {
          success: success,
          error: error
        });
      },
      update: function(model, success, error) {
        this.create(model, success, error);
      },
      read: function(model, success, error) {
        couch._db.openDoc(model.id, {
          success: success,
          error: error
        });
      },
      'delete': function(model, success, error) {
        couch._db.removeDoc(model.toJSON(), {
          success: success,
          error: error
        });
      }
    },
    collection: {
      read: function(model, success, error) {
        var opts = model.couch();
        var query = opts.design || Backbone.couch.options.design + '/' +
          opts.view;
        couch._db.view(query, _.extend({
          success: function(resp) {
            success(_.map(resp.rows, function(row, k) {
              _.extend(row, row.doc);
              if (!row.id && row._id) row.id = row._id;
              delete row._id;
              if (!row.id) row.id = k;
              return row;
            }));
          },
          error: error
        }, opts));
      }
    }
  };

  Backbone.sync = function(method, model, success, failure) {
    if (!couch._db) couch._db = $.couch.db(Backbone.couch.options.database);
    var type = 'model' in model ? 'collection' : 'model';
    couch[type][method](model, success, failure);
  };
})(jQuery);
