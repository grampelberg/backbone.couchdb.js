(function() {
  var App, Article, ArticleList, ArticleView, Articles, BaseContainer, BaseView, Channel, ChannelList, ChannelView, Channels;
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
      this.couch = __bind(this.couch, this);;      ArticleList.__super__.constructor.apply(this, arguments);
    }
    __extends(ArticleList, Backbone.couch.Collection);
    ArticleList.prototype.model = Article;
    ArticleList.prototype._db = Backbone.couch.db('backbone');
    ArticleList.prototype.change_feed = true;
    ArticleList.prototype.couch = function() {
      return {
        view: 'grizzly/type',
        key: 'article',
        filter: {
          filter: 'grizzly/article',
          channel: this.id
        },
        include_docs: true
      };
    };
    return ArticleList;
  })();
  Channel = (function() {
    function Channel() {
      Channel.__super__.constructor.apply(this, arguments);
    }
    __extends(Channel, Backbone.couch.Model);
    Channel.prototype._db = Backbone.couch.db('backbone');
    Channel.prototype.defaults = {
      type: 'channel'
    };
    return Channel;
  })();
  ChannelList = (function() {
    function ChannelList() {
      ChannelList.__super__.constructor.apply(this, arguments);
    }
    __extends(ChannelList, Backbone.couch.Collection);
    ChannelList.prototype.model = Channel;
    ChannelList.prototype._db = Backbone.couch.db('backbone');
    ChannelList.prototype.change_feed = true;
    ChannelList.prototype.couch = function() {
      return {
        view: 'grizzly/type',
        key: 'channel',
        include_docs: true
      };
    };
    return ChannelList;
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
  BaseContainer = (function() {
    function BaseContainer() {
      this.create_article = __bind(this.create_article, this);;
      this.add = __bind(this.add, this);;
      this.refresh = __bind(this.refresh, this);;      BaseContainer.__super__.constructor.apply(this, arguments);
    }
    __extends(BaseContainer, BaseView);
    BaseContainer.prototype.events = {
      "click .create": "create_article"
    };
    BaseContainer.prototype.initialize = function() {
      this.col = new this.collection;
      this.col.bind('refresh', this.refresh);
      this.col.bind('add', this.add);
      return this.col.fetch();
    };
    BaseContainer.prototype.refresh = function() {
      return this.col.each(this.add);
    };
    BaseContainer.prototype.add = function(model) {
      var view;
      view = new this.item_view({
        model: model
      });
      return this.$("ul").append(view.render().el);
    };
    BaseContainer.prototype.create_article = function() {
      var model;
      model = new this.col.model({
        body: this.$(this.input).val()
      });
      model.save();
      return this.col.add(model);
    };
    return BaseContainer;
  })();
  Articles = (function() {
    function Articles() {
      Articles.__super__.constructor.apply(this, arguments);
    }
    __extends(Articles, BaseContainer);
    Articles.prototype.template = "article_list";
    Articles.prototype.collection = ArticleList;
    Articles.prototype.item_view = ArticleView;
    Articles.prototype.input = "textarea";
    return Articles;
  })();
  ChannelView = (function() {
    function ChannelView() {
      ChannelView.__super__.constructor.apply(this, arguments);
    }
    __extends(ChannelView, BaseView);
    ChannelView.prototype.tagName = "li";
    ChannelView.prototype.className = "display";
    ChannelView.prototype.template = "channel";
    return ChannelView;
  })();
  Channels = (function() {
    function Channels() {
      Channels.__super__.constructor.apply(this, arguments);
    }
    __extends(Channels, BaseContainer);
    Channels.prototype.template = "channel_list";
    Channels.prototype.collection = ChannelList;
    Channels.prototype.item_view = ChannelView;
    Channels.prototype.input = "input[type=text]";
    return Channels;
  })();
  App = (function() {
    function App() {
      App.__super__.constructor.apply(this, arguments);
    }
    __extends(App, Backbone.View);
    App.prototype.el = $("#main");
    App.prototype.initialize = function() {
      this.$(".channels").html((new Channels).render().el);
      return this.$(".articles").html((new Articles).render().el);
    };
    return App;
  })();
  $(document).ready(function() {
    return new App;
  });
}).call(this);
