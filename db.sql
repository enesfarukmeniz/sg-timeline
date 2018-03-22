CREATE TABLE dlcs
(
    id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    steam_id INT(11) NOT NULL
);
CREATE UNIQUE INDEX dlc_id_uindex ON dlcs (id);
CREATE UNIQUE INDEX dlc_steam_id_uindex ON dlcs (steam_id);
CREATE TABLE games
(
    id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    steam_id INT(11) NOT NULL,
    steam_link VARCHAR(255) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    game_image_url VARCHAR(255),
    creator_name VARCHAR(255) NOT NULL,
    creator_profile_url VARCHAR(255) NOT NULL,
    creator_image_url VARCHAR(255),
    giveaway_level INT(11),
    current_status ENUM('blacklisted', 'beaten', 'backlog', 'active') DEFAULT 'backlog',
    playtime INT(11) DEFAULT '0',
    giveaway_win_date DATETIME,
    types SET('group', 'private', 'whitelist', 'region', 'public') NOT NULL,
    steam_id_real INT(11)
);
CREATE UNIQUE INDEX game_id_uindex ON games (id);
CREATE UNIQUE INDEX game_steam_id_uindex ON games (steam_id);
CREATE TABLE statistics_weekly
(
    id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    win INT(11) DEFAULT '0' NOT NULL,
    blacklisted INT(11) DEFAULT '0' NOT NULL,
    beaten INT(11) DEFAULT '0' NOT NULL,
    active INT(11) DEFAULT '0' NOT NULL,
    backlog INT(11) DEFAULT '0' NOT NULL,
    statistics_date DATE NOT NULL
);
CREATE UNIQUE INDEX statistics_weekly_id_uindex ON statistics_weekly (id);
CREATE UNIQUE INDEX statistics_weekly_statistics_date_uindex ON statistics_weekly (statistics_date);
CREATE TABLE statistics_monthly
(
    id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
    win INT(11) DEFAULT '0' NOT NULL,
    blacklisted INT(11) DEFAULT '0' NOT NULL,
    beaten INT(11) DEFAULT '0' NOT NULL,
    active INT(11) DEFAULT '0' NOT NULL,
    backlog INT(11) DEFAULT '0' NOT NULL,
    statistics_date DATE NOT NULL
);
CREATE UNIQUE INDEX statistics_monthly_id_uindex ON statistics_monthly (id);
CREATE UNIQUE INDEX statistics_monthly_statistics_date_uindex ON statistics_monthly (statistics_date);