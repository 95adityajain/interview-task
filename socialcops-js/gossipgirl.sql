-- phpMyAdmin SQL Dump
-- version 4.4.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Oct 26, 2016 at 09:41 PM
-- Server version: 5.6.26
-- PHP Version: 5.6.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gossipgirl`
--

-- --------------------------------------------------------

--
-- Table structure for table `notification_info`
--

CREATE TABLE IF NOT EXISTS `notification_info` (
  `id` bigint(11) NOT NULL,
  `verb` varchar(128) NOT NULL,
  `field_name` varchar(512) NOT NULL,
  `field_value` text NOT NULL,
  `actor_id` bigint(11) NOT NULL,
  `created_date` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `notification_info`
--

INSERT INTO `notification_info` (`id`, `verb`, `field_name`, `field_value`, `actor_id`, `created_date`) VALUES
(94, 'added', 'Location', 'Delhi', 38, '1477510662455'),
(95, 'added', 'Bank balance', '1,00,000', 38, '1477510676846'),
(96, 'added', 'Location', 'Noida', 39, '1477510691221'),
(97, 'added', 'Bank Balance', '5,00,000', 39, '1477510702714');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint(11) NOT NULL,
  `username` varchar(256) NOT NULL,
  `password` varchar(512) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `password`) VALUES
(38, 'user1', '123'),
(39, 'user2', '123');

-- --------------------------------------------------------

--
-- Table structure for table `user_fields`
--

CREATE TABLE IF NOT EXISTS `user_fields` (
  `id` bigint(11) NOT NULL,
  `user_id` bigint(11) NOT NULL,
  `field_name` varchar(512) NOT NULL,
  `field_value` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_fields`
--

INSERT INTO `user_fields` (`id`, `user_id`, `field_name`, `field_value`) VALUES
(61, 38, 'Location', 'Delhi'),
(62, 38, 'Bank balance', '1,00,000'),
(63, 39, 'Location', 'Noida'),
(64, 39, 'Bank Balance', '5,00,000');

-- --------------------------------------------------------

--
-- Table structure for table `user_subscription`
--

CREATE TABLE IF NOT EXISTS `user_subscription` (
  `user_id` bigint(11) NOT NULL,
  `subscribed_user_id` bigint(11) NOT NULL,
  `field_name` varchar(512) NOT NULL,
  `created_date` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_subscription`
--

INSERT INTO `user_subscription` (`user_id`, `subscribed_user_id`, `field_name`, `created_date`) VALUES
(39, 38, 'ALL', '1477510653028'),
(39, 38, 'Location', '1477510662429'),
(39, 38, 'Bank balance', '1477510676778'),
(38, 39, 'ALL', '1477510683416'),
(38, 39, 'Location', '1477510691211'),
(38, 39, 'Bank Balance', '1477510702673');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notification_info`
--
ALTER TABLE `notification_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actor_id` (`actor_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_fields`
--
ALTER TABLE `user_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_subscription`
--
ALTER TABLE `user_subscription`
  ADD KEY `user_id` (`user_id`),
  ADD KEY `subscribed_to_user_id` (`subscribed_user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notification_info`
--
ALTER TABLE `notification_info`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=98;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=40;
--
-- AUTO_INCREMENT for table `user_fields`
--
ALTER TABLE `user_fields`
  MODIFY `id` bigint(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=65;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `notification_info`
--
ALTER TABLE `notification_info`
  ADD CONSTRAINT `notification_info_ibfk_1` FOREIGN KEY (`actor_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user_fields`
--
ALTER TABLE `user_fields`
  ADD CONSTRAINT `user_fields_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user_subscription`
--
ALTER TABLE `user_subscription`
  ADD CONSTRAINT `user_subscription_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `user_subscription_ibfk_2` FOREIGN KEY (`subscribed_user_id`) REFERENCES `user` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
