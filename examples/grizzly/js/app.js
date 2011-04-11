(function() {
  var Article, ArticleList, ArticleView, Articles, BaseView;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Article = (function() {
    function Article() {
      Article.__super__.constructor.apply(this, arguments);
    }
    __extends(Article, Backbone.couch.Model);
    Article.prototype._db = Backbone.couch.db('backbone');
    Article.prototype.defaults = {
      type: "article"
    };
    return Article;
  })();
  ArticleList = (function() {
    function ArticleList() {
      ArticleList.__super__.constructor.apply(this, arguments);
    }
    __extends(ArticleList, Backbone.couch.Collection);
    ArticleList.prototype.model = Article;
    ArticleList.prototype._db = Backbone.couch.db('backbone');
    ArticleList.prototype.change_feed = true;
    ArticleList.prototype.couch = function() {
      return {
        view: 'grizzly/type',
        key: 'article',
        include_docs: true
      };
    };
    return ArticleList;
  })();
  BaseView = (function() {
    function BaseView() {
      this.render = __bind(this.render, this);;
      this._get_template = __bind(this._get_template, this);;      BaseView.__super__.constructor.apply(this, arguments);
    }
    __extends(BaseView, Backbone.View);
    BaseView.prototype._get_template = function(name) {
      if (!(BaseView._template_cache[name] != null)) {
        BaseView._template_cache[name] = Handlebars.compile($("#" + name).html());
      }
      return BaseView._template_cache[name];
    };
    BaseView.prototype.render = function() {
      var opts, _ref, _ref2, _ref3;
      opts = (_ref = (_ref2 = this.model) != null ? _ref2.toJSON() : void 0) != null ? _ref : {};
      _.extend(opts, (_ref3 = this.options) != null ? _ref3 : {});
      $(this.el).html(this._get_template(this.template)(opts));
      _.defer(__bind(function() {
        return this.trigger('render');
      }, this));
      return this;
    };
    return BaseView;
  })();
  BaseView._template_cache = {};
  ArticleView = (function() {
    function ArticleView() {
      this.update_post = __bind(this.update_post, this);;
      this.save_update = __bind(this.save_update, this);;
      this.allow_update = __bind(this.allow_update, this);;
      this.remove_post = __bind(this.remove_post, this);;
      this._remove = __bind(this._remove, this);;
      this.initialize = __bind(this.initialize, this);;      ArticleView.__super__.constructor.apply(this, arguments);
    }
    __extends(ArticleView, BaseView);
    ArticleView.prototype.tagName = "li";
    ArticleView.prototype.className = "display";
    ArticleView.prototype.template = "article";
    ArticleView.prototype.events = {
      "click .del": "remove_post",
      "click .edit": "allow_update",
      "click .save": "save_update"
    };
    ArticleView.prototype.initialize = function() {
      this.model.bind("change:body", this.update_post);
      return this.model.bind("remove", this._remove);
    };
    ArticleView.prototype._remove = function() {
      return this.remove();
    };
    ArticleView.prototype.remove_post = function() {
      return this.model.destroy();
    };
    ArticleView.prototype.allow_update = function() {
      $(this.el).removeClass("display").addClass("edit");
      return this.$("textarea").val(this.$("p").text());
    };
    ArticleView.prototype.save_update = function() {
      $(this.el).removeClass("edit").addClass("display");
      this.model.set({
        body: this.$("textarea").val()
      });
      return this.model.save();
    };
    ArticleView.prototype.update_post = function() {
      return this.$("p").text(this.model.get("body"));
    };
    return ArticleView;
  })();
  Articles = (function() {
    function Articles() {
      this.create_article = __bind(this.create_article, this);;
      this.add = __bind(this.add, this);;
      this.refresh = __bind(this.refresh, this);;      Articles.__super__.constructor.apply(this, arguments);
    }
    __extends(Articles, Backbone.View);
    Articles.prototype.el = $("#main");
    Articles.prototype.events = {
      "click .create": "create_article"
    };
    Articles.prototype.initialize = function() {
      this.col = new ArticleList;
      this.col.bind('refresh', this.refresh);
      this.col.bind('add', this.add);
      return this.col.fetch();
    };
    Articles.prototype.refresh = function() {
      return this.col.each(this.add);
    };
    Articles.prototype.add = function(model) {
      var view;
      view = new ArticleView({
        model: model
      });
      return this.$("ul").append(view.render().el);
    };
    Articles.prototype.create_article = function() {
      var model;
      model = new Article({
        body: this.$("textarea").val()
      });
      model.save();
      return this.col.add(model);
    };
    return Articles;
  })();
  new Articles;
}).call(this);
