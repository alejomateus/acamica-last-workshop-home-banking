SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `home_banking` DEFAULT CHARACTER SET utf8 COLLATE utf8_spanish_ci;
USE `home_banking`;

CREATE TABLE `Accounts` (
  `id` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `account_number` int(11) DEFAULT NULL,
  `balance` double(40,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

CREATE TABLE `Transfers` (
  `id` int(11) NOT NULL,
  `id_account_origin` int(11) DEFAULT NULL,
  `id_account_destination` int(11) DEFAULT NULL,
  `amount` double(40,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

CREATE TABLE `Users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_spanish_ci NOT NULL,
  `lastname` varchar(255) COLLATE utf8_spanish_ci NOT NULL,
  `identification` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;


ALTER TABLE `Accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`);

ALTER TABLE `Transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_account_origin` (`id_account_origin`),
  ADD KEY `id_account_destination` (`id_account_destination`);

ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `Accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `Transfers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `Users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `Accounts`
  ADD CONSTRAINT `Accounts_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users` (`id`);

ALTER TABLE `Transfers`
  ADD CONSTRAINT `Transfers_ibfk_1` FOREIGN KEY (`id_account_origin`) REFERENCES `Accounts` (`id`),
  ADD CONSTRAINT `Transfers_ibfk_2` FOREIGN KEY (`id_account_destination`) REFERENCES `Accounts` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
