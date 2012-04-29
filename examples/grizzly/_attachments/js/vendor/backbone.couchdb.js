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
    _format_row: function(row) {
      _.extend(row, row.value ? { value: row.value } : {}, row.doc);
      // if (!row.id && row._id) row.id = row._id;

      // Since we reassigned these, remove them from the object;
      // delete row._id;
      delete row.doc;

      // if (!row.id) row.id = k;
      return row;
    },
    _ignores: [ 'view', 'update', 'filter' ],
    _remove: function(opts) {
      _.each(couch._ignores, function(v) {
        delete opts[v];
      });
    },
    model: {
      create: function(_db, model, cb) {
        var opts = (model.couch && model.couch()) || {};
        var method = _.bind(_db.saveDoc, _db);
        if ('update' in opts)
          method = _.bind(_db.updateDoc, _db, opts.update);

        couch._remove(opts);
        method(model.toJSON(), _.extend(opts, {
          success: function(resp) {
            cb.success(_.extend({
              _id: resp.id,
              _rev: resp.rev
            }, resp.doc));
          },
          error: cb.error
        }));
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
        _db.removeDoc(_.extend({ _id: model.id }, model.toJSON()), {
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
        var query = opts.view;
        couch._remove(opts);
        _db.view(query, _.extend({
          success: function(resp) {
            cb.success(_.map(resp.rows, couch._format_row));
          },
          error: cb.error
        }, opts));
      }
    },
    sync: function(method, model, cb) {
      // XXX - This is going to be a memory issue unless someone does the
      // extend trick.
      _db = this._db || (this.collection && this.collection._db);
      if (!_db) this._db = Backbone.couch.db(
        Backbone.couch.options.database);
      var type = 'model' in model ? 'collection' : 'model';
      couch[type][method](_db, model, cb);
    }
  };

  Backbone.couch.db = function(name, db_opts) {
    if (!db_opts) db_opts = {};
    var old_prefix = $.couch.urlPrefix;
    $.couch.urlPrefix = db_opts.host || $.couch.urlPrefix;

    var ret = $.couch.db(name, db_opts);
    _.extend(ret, {
      updateDoc: function(handler, doc, options) {
        var current_uri = this.uri;

        var name = handler.split('/');
        this.uri = this.uri + '_design/' + name[0] + '/_update/' + name[1];
        this.saveDoc(doc, options);

        this.uri = current_uri;
      }
    });
    $.couch.urlPrefix = old_prefix;
    return ret
  };

  Backbone.couch.sync = couch.sync;

  Backbone.couch.Model = Backbone.Model.extend({
    sync: couch.sync,
    idAttribute: '_id'
  });

  Backbone.couch.Collection = Backbone.Collection.extend({
    sync: couch.sync,
    change_feed: false,
    initialize: function() {
      _.bindAll(this, '_init_changes', '_on_change');

      if (this.change_feed)
        this._db.info({
          success: this._init_changes
        });
    },
    _init_changes: function(state) {
      var seq = state.update_seq || 0;

      var opts = { include_docs: true };
      var col_opts = this.couch();
      if ('filter' in col_opts)
        _.extend(opts, col_opts.filter);

      this._changes = this._db.changes(seq, opts);
      this._changes.onChange(this._on_change);
    },
    _on_change: function(changes) {
      var _this = this;
      _.each(changes.results, function(res) {
        var client_model = _this.get(res.id);

        if (client_model) {
          if (res.deleted) return _this.remove(client_model);
          if (client_model.get('_rev') == res.doc._rev) return

          return client_model.set(res.doc);
        }

        if (res.deleted) return
        _this.add(couch._format_row(res));
      });
    }
  });

})(jQuery);
