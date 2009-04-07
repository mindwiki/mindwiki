CREATE TABLE `articles` (
  `id` int(11) NOT NULL auto_increment,
  `content` text,
  `created_at` datetime default NULL,
  `updated_at` datetime default NULL,
  `content_type` int(11) default '1',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8;

CREATE TABLE `edges` (
  `id` int(11) NOT NULL auto_increment,
  `source_id` int(11) default NULL,
  `target_id` int(11) default NULL,
  `directed` tinyint(1) default NULL,
  `name` varchar(255) default NULL,
  `color` varchar(255) default NULL,
  `created_at` datetime default NULL,
  `updated_at` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=754664432 DEFAULT CHARSET=utf8;

CREATE TABLE `graphs` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) default NULL,
  `user_id` int(11) default NULL,
  `created_at` datetime default NULL,
  `updated_at` datetime default NULL,
  `color` varchar(255) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;

CREATE TABLE `notes` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(255) default NULL,
  `x` int(11) default NULL,
  `y` int(11) default NULL,
  `width` int(11) default NULL,
  `height` int(11) default NULL,
  `color` varchar(255) default NULL,
  `article_id` int(11) default NULL,
  `graph_id` int(11) default NULL,
  `created_at` datetime default NULL,
  `updated_at` datetime default NULL,
  `zorder` int(11) default '10',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=188 DEFAULT CHARSET=utf8;

CREATE TABLE `schema_migrations` (
  `version` varchar(255) NOT NULL,
  UNIQUE KEY `unique_schema_migrations` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `sync_logs` (
  `id` int(11) NOT NULL auto_increment,
  `created_at` datetime default NULL,
  `graph_id` int(11) default NULL,
  `params` text,
  PRIMARY KEY  (`id`),
  KEY `time_graph_index` (`created_at`,`graph_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `users` (
  `id` int(11) NOT NULL auto_increment,
  `login` varchar(255) default NULL,
  `email` varchar(255) default NULL,
  `crypted_password` varchar(40) default NULL,
  `salt` varchar(40) default NULL,
  `created_at` datetime default NULL,
  `updated_at` datetime default NULL,
  `remember_token` varchar(255) default NULL,
  `remember_token_expires_at` datetime default NULL,
  `deleted` tinyint(1) default '0',
  `admin` tinyint(1) default '0',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

INSERT INTO schema_migrations (version) VALUES ('20081205063512');

INSERT INTO schema_migrations (version) VALUES ('20081205063651');

INSERT INTO schema_migrations (version) VALUES ('20081205063746');

INSERT INTO schema_migrations (version) VALUES ('20081205063821');

INSERT INTO schema_migrations (version) VALUES ('20081205064406');

INSERT INTO schema_migrations (version) VALUES ('20081230071729');

INSERT INTO schema_migrations (version) VALUES ('20081230073039');

INSERT INTO schema_migrations (version) VALUES ('20090212063839');

INSERT INTO schema_migrations (version) VALUES ('20090217094332');