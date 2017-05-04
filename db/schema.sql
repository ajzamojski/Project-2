CREATE DATABASE bavart_db;

USE bavart_db;

CREATE TABLE items (
	`itemNumber` VARCHAR(5) NOT NULL,
	`openingBid` INTEGER(99) NOT NULL,
	`picture` VARCHAR NOT NULL,
	PRIMARY KEY(itemNumber)
);

Create TABLE users (
	`username` VARCHAR(128) NOT NULL,
	`firstName` VARCHAR(128) NOT NULL,
	`lastName` VARCHAR(128) NOT NULL,y
	`phoneNumber` VARCHAR(10) NOT NULL,
	`itemNumber` VARCHAR(5) NOT NULL,
	`bid` VARCHAR(128) NOT NULL,
	`date` TIMESTAMP NOT NULL,
	PRIMARY KEY(username)
);
