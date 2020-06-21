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
  `idUser` int(11) DEFAULT NULL,
  `account_number` int(11) DEFAULT NULL,
  `balance` double(40,2) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `status` enum ('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

CREATE TABLE `Transfers` (
  `id` int(11) NOT NULL,
  `idAccountOrigin` int(11) DEFAULT NULL,
  `idAccountDestination` int(11) DEFAULT NULL,
  `amount` double(40,2) DEFAULT NULL,
  `idUser` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

CREATE TABLE `Users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `lastname` varchar(50) COLLATE utf8_spanish_ci NOT NULL,
  `identification` int(11) NOT NULL UNIQUE,
  `email` varchar(50) COLLATE utf8_spanish_ci NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','client') DEFAULT 'client'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;


ALTER TABLE `Accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUser` (`idUser`);

ALTER TABLE `Transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idAccountOrigin` (`idAccountOrigin`),
  ADD KEY `idAccountDestination` (`idAccountDestination`);

ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `Accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `Transfers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `Users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `Accounts`
  ADD CONSTRAINT `Accounts_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `Users` (`id`);

ALTER TABLE `Transfers`
  ADD CONSTRAINT `Transfers_ibfk_1` FOREIGN KEY (`idAccountOrigin`) REFERENCES `Accounts` (`id`),
  ADD CONSTRAINT `Transfers_ibfk_2` FOREIGN KEY (`idAccountDestination`) REFERENCES `Accounts` (`id`),
  ADD CONSTRAINT `Transfers_ibfk_3` FOREIGN KEY (`idUser`) REFERENCES `Users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
