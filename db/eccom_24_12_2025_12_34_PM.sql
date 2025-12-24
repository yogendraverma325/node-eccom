CREATE DATABASE  IF NOT EXISTS `kidsgamingzone` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `kidsgamingzone`;
-- MySQL dump 10.13  Distrib 8.0.33, for macos13 (arm64)
--
-- Host: 127.0.0.1    Database: kidsgamingzone
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `business_logic`
--

DROP TABLE IF EXISTS `business_logic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_logic` (
  `business_logic_auto_id` int NOT NULL AUTO_INCREMENT,
  `records_for` varchar(255) NOT NULL,
  `key` varchar(45) NOT NULL,
  `value_type` varchar(45) DEFAULT NULL,
  `value` varchar(45) NOT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`business_logic_auto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_logic`
--

LOCK TABLES `business_logic` WRITE;
/*!40000 ALTER TABLE `business_logic` DISABLE KEYS */;
INSERT INTO `business_logic` VALUES (1,'SHIPPING_DETAILS','MIN_CART_VALUE','NUMBER','200',NULL,NULL,'2025-12-18 13:14:03','2025-12-18 14:44:42'),(2,'SHIPPING_DETAILS','SHIPPING_FEE','NUMBER','70',NULL,NULL,'2025-12-18 14:19:55','2025-12-18 14:19:55'),(3,'STORE_INFO','MON_FRI_TIMING','STRING','10.00 am - 7.00 pm',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 14:37:29'),(4,'STORE_INFO','SAT_SUN_TIMING','STRING','8.00 pm - 8.00 pm',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 14:33:36'),(5,'STORE_INFO','PHONE','STRING','9389649459',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 14:33:36'),(6,'STORE_INFO','EMAIL','STRING','skillscandy@gmail.com',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 14:33:36'),(7,'STORE_INFO','FB_URL','STRING','https://www.facebook.com/',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 14:33:36'),(8,'STORE_INFO','STORE_ADD','STRING','E 5 Ram Nagar',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 15:04:19'),(9,'STORE_INFO','PHONE_2','STRING','9389649458',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 15:02:04'),(10,'STORE_INFO','NAME','STRING','Apna local store',NULL,NULL,'2025-12-18 14:33:36','2025-12-18 15:02:04');
/*!40000 ALTER TABLE `business_logic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `catAutoId` int NOT NULL AUTO_INCREMENT,
  `parent` int DEFAULT '0',
  `categoryName` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `slug` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`catAutoId`,`image`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,0,'Foot Wear','fetured-item-1.png',1,'2025-07-07 18:15:38','2025-12-18 21:45:19','footwear'),(2,0,'Top Wear','fetured-item-2.png',1,'2025-07-07 18:15:38','2025-12-18 21:45:19','topwear'),(3,1,'Sneakers','fetured-item-3.png',1,'2025-07-07 18:15:38','2025-12-18 21:51:43','sneakers'),(4,1,'Formal Shoes','fetured-item-4.png',1,'2025-07-07 18:15:38','2025-12-18 21:51:43','formal-shoes'),(5,2,'T-Shirts','fetured-item-5.png',1,'2025-07-07 18:15:38','2025-12-18 21:51:43','t-shirts'),(6,2,'Shirts','fetured-item-6.png',1,'2025-07-07 18:15:38','2025-12-18 21:51:43','casual-shirts');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citymaster`
--

DROP TABLE IF EXISTS `citymaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citymaster` (
  `cityId` int NOT NULL AUTO_INCREMENT,
  `cityCode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cityType` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cityName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stateId` int NOT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedBy` int DEFAULT NULL,
  `updatedAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`cityId`)
) ENGINE=InnoDB AUTO_INCREMENT=576 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citymaster`
--

LOCK TABLES `citymaster` WRITE;
/*!40000 ALTER TABLE `citymaster` DISABLE KEYS */;
INSERT INTO `citymaster` VALUES (2,'Agra','Cosmopolitan','Agra',34,NULL,'2024-02-29 14:20:44.258',NULL,NULL,0),(8,'Aligarh','Cosmopolitan','Aligarh',34,NULL,'2024-02-29 14:20:44.259',NULL,NULL,0),(9,'Allahabad','Cosmopolitan','Allahabad',34,NULL,'2024-02-29 14:20:44.259',NULL,NULL,0),(16,'Ambedkar Nagar','Cosmopolitan','Ambedkar Nagar',34,NULL,'2024-02-29 14:20:44.261',NULL,NULL,0),(28,'Auraiya','Cosmopolitan','Auraiya',34,NULL,'2024-02-29 14:20:44.262',NULL,NULL,0),(31,'Azamgarh','Cosmopolitan','Azamgarh',34,NULL,'2024-02-29 14:20:44.263',NULL,NULL,0),(34,'Bagpat','Cosmopolitan','Bagpat',34,NULL,'2024-02-29 14:20:44.263',NULL,NULL,0),(35,'Bahraich','Cosmopolitan','Bahraich',34,NULL,'2024-02-29 14:20:44.264',NULL,NULL,0),(39,'Ballia','Cosmopolitan','Ballia',34,NULL,'2024-02-29 14:20:44.264',NULL,NULL,0),(40,'Balrampur','Cosmopolitan','Balrampur',34,NULL,'2024-02-29 14:20:44.265',NULL,NULL,0),(42,'Banda','Cosmopolitan','Banda',34,NULL,'2024-02-29 14:20:44.265',NULL,NULL,0),(46,'Barabanki','Cosmopolitan','Barabanki',34,NULL,'2024-02-29 14:20:44.265',NULL,NULL,0),(50,'Bareilly','Cosmopolitan','Bareilly',34,NULL,'2024-02-29 14:20:44.266',NULL,NULL,0),(55,'Basti','Cosmopolitan','Basti',34,NULL,'2024-02-29 14:20:44.267',NULL,NULL,0),(79,'Bijnor','Cosmopolitan','Bijnor',34,NULL,'2024-02-29 14:20:44.271',NULL,NULL,0),(85,'Budaun','Cosmopolitan','Budaun',34,NULL,'2024-02-29 14:20:44.272',NULL,NULL,0),(87,'Bulandshahr','Cosmopolitan','Bulandshahr',34,NULL,'2024-02-29 14:20:44.272',NULL,NULL,0),(98,'Chandauli','Cosmopolitan','Chandauli',34,NULL,'2024-02-29 14:20:44.275',NULL,NULL,0),(114,'Chitrakoot','Cosmopolitan','Chitrakoot',34,NULL,'2024-02-29 14:20:44.278',NULL,NULL,0),(136,'Deoria','Cosmopolitan','Deoria',34,NULL,'2024-02-29 14:20:44.281',NULL,NULL,0),(165,'Etah','Cosmopolitan','Etah',34,NULL,'2024-02-29 14:20:44.286',NULL,NULL,0),(166,'Etawah','Cosmopolitan','Etawah',34,NULL,'2024-02-29 14:20:44.286',NULL,NULL,0),(167,'Faizabad','Cosmopolitan','Faizabad',34,NULL,'2024-02-29 14:20:44.286',NULL,NULL,0),(170,'Farrukhabad','Cosmopolitan','Farrukhabad',34,NULL,'2024-02-29 14:20:44.287',NULL,NULL,0),(172,'Fatehpur','Cosmopolitan','Fatehpur',34,NULL,'2024-02-29 14:20:44.287',NULL,NULL,0),(175,'Firozabad','Cosmopolitan','Firozabad',34,NULL,'2024-02-29 14:20:44.288',NULL,NULL,0),(181,'Gautam Buddha Nagar','Cosmopolitan','Gautam Buddha Nagar',34,NULL,'2024-02-29 14:20:44.289',NULL,NULL,0),(183,'Ghaziabad','Cosmopolitan','Ghaziabad',34,NULL,'2024-02-29 14:20:44.289',NULL,NULL,0),(184,'Ghazipur','Cosmopolitan','Ghazipur',34,NULL,'2024-02-29 14:20:44.290',NULL,NULL,0),(190,'Gonda','Cosmopolitan','Gonda',34,NULL,'2024-02-29 14:20:44.291',NULL,NULL,0),(193,'Gorakhpur','Cosmopolitan','Gorakhpur',34,NULL,'2024-02-29 14:20:44.292',NULL,NULL,0),(204,'Hamirpur (UP)','Cosmopolitan','Hamirpur (UP)',34,NULL,'2024-02-29 14:20:44.294',NULL,NULL,0),(207,'Hardoi','Cosmopolitan','Hardoi',34,NULL,'2024-02-29 14:20:44.294',NULL,NULL,0),(210,'Hathras','Cosmopolitan','Hathras',34,NULL,'2024-02-29 14:20:44.295',NULL,NULL,0),(234,'Jalaun','Cosmopolitan','Jalaun',34,NULL,'2024-02-29 14:20:44.300',NULL,NULL,0),(241,'Jaunpur','Cosmopolitan','Jaunpur',34,NULL,'2024-02-29 14:20:44.302',NULL,NULL,0),(243,'Jhansi','Cosmopolitan','Jhansi',34,NULL,'2024-02-29 14:20:44.302',NULL,NULL,0),(248,'Jyotiba Phule Nagar','Cosmopolitan','Jyotiba Phule Nagar',34,NULL,'2024-02-29 14:20:44.303',NULL,NULL,0),(253,'Kannauj','Cosmopolitan','Kannauj',34,NULL,'2024-02-29 14:20:44.304',NULL,NULL,0),(256,'Kanpur Dehat','Cosmopolitan','Kanpur Dehat',34,NULL,'2024-02-29 14:20:44.304',NULL,NULL,0),(257,'Kanpur Nagar','Metropolitan','Kanpur Nagar',34,NULL,'2024-02-29 14:20:44.304',NULL,NULL,0),(271,'Kaushambi','Cosmopolitan','Kaushambi',34,NULL,'2024-02-29 14:20:44.307',NULL,NULL,0),(277,'Kheri','Cosmopolitan','Kheri',34,NULL,'2024-02-29 14:20:44.308',NULL,NULL,0),(297,'Kushinagar','Cosmopolitan','Kushinagar',34,NULL,'2024-02-29 14:20:44.312',NULL,NULL,0),(301,'Lalitpur','Cosmopolitan','Lalitpur',34,NULL,'2024-02-29 14:20:44.312',NULL,NULL,0),(308,'Lucknow','Metropolitan','Lucknow',34,NULL,'2024-02-29 14:20:44.314',NULL,NULL,0),(315,'Maharajganj','Cosmopolitan','Maharajganj',34,NULL,'2024-02-29 14:20:44.315',NULL,NULL,0),(317,'Mahoba','Cosmopolitan','Mahoba',34,NULL,'2024-02-29 14:20:44.315',NULL,NULL,0),(318,'Mainpuri','Cosmopolitan','Mainpuri',34,NULL,'2024-02-29 14:20:44.315',NULL,NULL,0),(328,'Mathura','Cosmopolitan','Mathura',34,NULL,'2024-02-29 14:20:44.317',NULL,NULL,1),(329,'Mau','Cosmopolitan','Mau',34,NULL,'2024-02-29 14:20:44.317',NULL,NULL,0),(335,'Meerut','Cosmopolitan','Meerut',34,NULL,'2024-02-29 14:20:44.318',NULL,NULL,0),(338,'Mirzapur','Cosmopolitan','Mirzapur',34,NULL,'2024-02-29 14:20:44.319',NULL,NULL,0),(344,'Moradabad','Cosmopolitan','Moradabad',34,NULL,'2024-02-29 14:20:44.321',NULL,NULL,0),(349,'Muzaffarnagar','Cosmopolitan','Muzaffarnagar',34,NULL,'2024-02-29 14:20:44.322',NULL,NULL,0),(400,'Pilibhit','Cosmopolitan','Pilibhit',34,NULL,'2024-02-29 14:20:44.330',NULL,NULL,0),(409,'Pratapgarh','Cosmopolitan','Pratapgarh',34,NULL,'2024-02-29 14:20:44.332',NULL,NULL,0),(419,'Raebareli','Cosmopolitan','Raebareli',34,NULL,'2024-02-29 14:20:44.333',NULL,NULL,0),(429,'Rampur','Cosmopolitan','Rampur',34,NULL,'2024-02-29 14:20:44.335',NULL,NULL,0),(445,'Saharanpur','Cosmopolitan','Saharanpur',34,NULL,'2024-02-29 14:20:44.338',NULL,NULL,0),(454,'Sant Kabir Nagar','Cosmopolitan','Sant Kabir Nagar',34,NULL,'2024-02-29 14:20:44.339',NULL,NULL,0),(455,'Sant Ravidas Nagar','Cosmopolitan','Sant Ravidas Nagar',34,NULL,'2024-02-29 14:20:44.340',NULL,NULL,0),(465,'Shahjahanpur','Cosmopolitan','Shahjahanpur',34,NULL,'2024-02-29 14:20:44.341',NULL,NULL,0),(468,'Shrawasti','Cosmopolitan','Shrawasti',34,NULL,'2024-02-29 14:20:44.342',NULL,NULL,0),(470,'Siddharthnagar','Cosmopolitan','Siddharthnagar',34,NULL,'2024-02-29 14:20:44.342',NULL,NULL,0),(477,'Sitapur','Cosmopolitan','Sitapur',34,NULL,'2024-02-29 14:20:44.343',NULL,NULL,0),(482,'Sonbhadra','Cosmopolitan','Sonbhadra',34,NULL,'2024-02-29 14:20:44.344',NULL,NULL,0),(493,'Sultanpur','Cosmopolitan','Sultanpur',34,NULL,'2024-02-29 14:20:44.346',NULL,NULL,0),(535,'Unnao','Cosmopolitan','Unnao',34,NULL,'2024-02-29 14:20:44.353',NULL,NULL,0),(544,'Varanasi','Cosmopolitan','Varanasi',34,NULL,'2024-02-29 14:20:44.354',NULL,NULL,0),(566,'Noida','Metropolitan','Noida',34,NULL,'2024-02-29 14:20:44.354',NULL,NULL,0),(575,'Kanpur','Metropolitan','Kanpur',34,NULL,'2024-02-29 14:20:44.354',NULL,NULL,0);
/*!40000 ALTER TABLE `citymaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_auto_id` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `offerprice` decimal(10,2) DEFAULT NULL,
  `qty` int DEFAULT NULL,
  `item_total` decimal(10,2) DEFAULT NULL,
  `item_status` varchar(20) DEFAULT NULL,
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,8,90.00,280.00,2,180.00,'active',1,1,'2025-12-24 12:13:57','2025-12-24 12:13:57'),(2,2,8,90.00,280.00,2,180.00,'active',1,1,'2025-12-24 12:14:36','2025-12-24 12:14:36'),(3,3,8,90.00,280.00,2,180.00,'active',1,1,'2025-12-24 12:16:11','2025-12-24 12:16:11'),(4,4,8,90.00,280.00,2,180.00,'active',1,1,'2025-12-24 12:22:12','2025-12-24 12:22:12'),(5,5,5,350.00,0.00,1,350.00,'active',1,1,'2025-12-24 12:24:21','2025-12-24 12:24:21'),(6,6,6,70.00,0.00,1,70.00,'active',1,1,'2025-12-24 12:28:08','2025-12-24 12:28:08'),(7,7,6,70.00,0.00,1,70.00,'active',1,1,'2025-12-24 12:30:10','2025-12-24 12:30:10'),(8,8,6,70.00,0.00,1,70.00,'active',1,1,'2025-12-24 12:31:27','2025-12-24 12:31:27'),(9,9,6,70.00,0.00,1,70.00,'active',1,1,'2025-12-24 12:32:44','2025-12-24 12:32:44'),(10,10,6,70.00,0.00,1,70.00,'active',1,1,'2025-12-24 12:33:12','2025-12-24 12:33:12');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_returns`
--

DROP TABLE IF EXISTS `order_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_returns` (
  `return_id` int NOT NULL AUTO_INCREMENT,
  `order_item_id` int DEFAULT NULL,
  `return_qty` int DEFAULT NULL,
  `return_reason` varchar(255) DEFAULT NULL,
  `return_status` varchar(20) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_mode` varchar(50) DEFAULT NULL,
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`return_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_returns`
--

LOCK TABLES `order_returns` WRITE;
/*!40000 ALTER TABLE `order_returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_shipping`
--

DROP TABLE IF EXISTS `order_shipping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_shipping` (
  `order_shipping_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text,
  `landmark` varchar(100) DEFAULT NULL,
  `state` int DEFAULT NULL,
  `city` int DEFAULT NULL,
  `pincode` int DEFAULT NULL,
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_shipping_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_shipping`
--

LOCK TABLES `order_shipping` WRITE;
/*!40000 ALTER TABLE `order_shipping` DISABLE KEYS */;
INSERT INTO `order_shipping` VALUES (1,1,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:13:57','2025-12-24 12:13:57'),(2,2,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:14:36','2025-12-24 12:14:36'),(3,3,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:16:11','2025-12-24 12:16:11'),(4,4,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:22:12','2025-12-24 12:22:12'),(5,5,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:24:21','2025-12-24 12:24:21'),(6,6,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:28:08','2025-12-24 12:28:08'),(7,7,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:30:10','2025-12-24 12:30:10'),(8,8,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:31:27','2025-12-24 12:31:27'),(9,9,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:32:44','2025-12-24 12:32:44'),(10,10,'yogi verma','7017734526','E 5 ram nagar post krishna nagar mathura','near shiv park',34,328,3375,1,1,'2025-12-24 12:33:12','2025-12-24 12:33:12');
/*!40000 ALTER TABLE `order_shipping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `shipping_amount` decimal(10,2) DEFAULT NULL,
  `grand_total` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT NULL,
  `order_status` varchar(20) DEFAULT NULL,
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-20251224-00000001',1,180.00,1.80,'abc',70.00,248.20,'POD','pending','confirmed',1,1,'2025-12-24 12:13:57','2025-12-24 12:13:57'),(2,'ORD-20251224-00000002',1,180.00,1.80,'abc',70.00,248.20,'POD','pending','confirmed',1,1,'2025-12-24 12:14:36','2025-12-24 12:14:36'),(3,'ORD-20251224-00000003',1,180.00,1.80,'abc',70.00,248.20,'POD','pending','confirmed',1,1,'2025-12-24 12:16:11','2025-12-24 12:16:11'),(4,'ORD-20251224-00000004',1,180.00,1.80,'abc',70.00,248.20,'POD','pending','confirmed',1,1,'2025-12-24 12:22:12','2025-12-24 12:22:12'),(5,'ORD-20251224-00000005',1,350.00,3.50,'abc',0.00,346.50,'POD','pending','confirmed',1,1,'2025-12-24 12:24:21','2025-12-24 12:24:21'),(6,'ORD-20251224-00000006',1,70.00,0.70,'abc',70.00,139.30,'POD','pending','confirmed',1,1,'2025-12-24 12:28:08','2025-12-24 12:28:08'),(7,'ORD-20251224-00000007',1,70.00,0.70,'abc',70.00,139.30,'POD','pending','confirmed',1,1,'2025-12-24 12:30:10','2025-12-24 12:30:10'),(8,'ORD-20251224-00000008',1,70.00,0.70,'abc',70.00,139.30,'POD','pending','confirmed',1,1,'2025-12-24 12:31:27','2025-12-24 12:31:27'),(9,'ORD-20251224-00000009',1,70.00,0.70,'abc',70.00,139.30,'POD','pending','confirmed',1,1,'2025-12-24 12:32:44','2025-12-24 12:32:44'),(10,'ORD-20251224-00000010',1,70.00,0.70,'abc',70.00,139.30,'POD','pending','confirmed',1,1,'2025-12-24 12:33:12','2025-12-24 12:33:12');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pincodemaster`
--

DROP TABLE IF EXISTS `pincodemaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pincodemaster` (
  `pincodeId` int NOT NULL AUTO_INCREMENT,
  `pincode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cityId` int NOT NULL,
  `areaName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedBy` int DEFAULT NULL,
  `updatedAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint DEFAULT NULL,
  PRIMARY KEY (`pincodeId`)
) ENGINE=InnoDB AUTO_INCREMENT=3403 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pincodemaster`
--

LOCK TABLES `pincodemaster` WRITE;
/*!40000 ALTER TABLE `pincodemaster` DISABLE KEYS */;
INSERT INTO `pincodemaster` VALUES (3374,'281003',328,'NA',NULL,'2025-12-23 22:10:57.765',NULL,NULL,0),(3375,'281004',328,'Mathura Central',NULL,'2025-12-23 22:10:57.766',NULL,NULL,1),(3376,'281005',328,'NA',NULL,'2025-12-23 22:10:57.767',NULL,NULL,0),(3377,'281006',328,'NA',NULL,'2025-12-23 22:10:57.767',NULL,NULL,0),(3379,'281121',328,'NA',NULL,'2025-12-23 22:10:57.767',NULL,NULL,0),(3380,'281122',328,'NA',NULL,'2025-12-23 22:10:57.768',NULL,NULL,0),(3381,'281123',328,'NA',NULL,'2025-12-23 22:10:57.768',NULL,NULL,0),(3382,'281201',328,'NA',NULL,'2025-12-23 22:10:57.768',NULL,NULL,0),(3383,'281202',328,'NA',NULL,'2025-12-23 22:10:57.768',NULL,NULL,0),(3384,'281203',328,'NA',NULL,'2025-12-23 22:10:57.769',NULL,NULL,0),(3385,'281204',328,'NA',NULL,'2025-12-23 22:10:57.769',NULL,NULL,0),(3386,'281205',328,'NA',NULL,'2025-12-23 22:10:57.769',NULL,NULL,0),(3387,'281206',328,'NA',NULL,'2025-12-23 22:10:57.769',NULL,NULL,0),(3388,'281301',328,'NA',NULL,'2025-12-23 22:10:57.770',NULL,NULL,0),(3389,'281302',328,'NA',NULL,'2025-12-23 22:10:57.770',NULL,NULL,0),(3390,'281303',328,'NA',NULL,'2025-12-23 22:10:57.770',NULL,NULL,0),(3391,'281305',328,'NA',NULL,'2025-12-23 22:10:57.770',NULL,NULL,0),(3396,'281403',328,'NA',NULL,'2025-12-23 22:10:57.771',NULL,NULL,0),(3397,'281404',328,'NA',NULL,'2025-12-23 22:10:57.771',NULL,NULL,0),(3398,'281405',328,'NA',NULL,'2025-12-23 22:10:57.771',NULL,NULL,0),(3399,'281406',328,'NA',NULL,'2025-12-23 22:10:57.771',NULL,NULL,0),(3400,'281501',328,'NA',NULL,'2025-12-23 22:10:57.771',NULL,NULL,0),(3401,'281502',328,'NA',NULL,'2025-12-23 22:10:57.772',NULL,NULL,0),(3402,'281504',328,'NA',NULL,'2025-12-23 22:10:57.772',NULL,NULL,0);
/*!40000 ALTER TABLE `pincodemaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `product_auto_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` double(10,2) unsigned DEFAULT '0.00',
  `offerprice` double(10,2) DEFAULT '0.00',
  `description` varchar(255) DEFAULT NULL,
  `long_description` mediumtext,
  `rating` int DEFAULT '0',
  `review` int DEFAULT '0',
  `slug` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `variant_available` int DEFAULT '0',
  `for_gender` int DEFAULT NULL,
  `gender_applicability` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`product_auto_id`),
  KEY `idx_product_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'Xiaomi','product-1.jpg',200.00,0.00,NULL,NULL,1,1,'xiaomi',1,'2025-07-07 18:46:07','2025-12-23 16:30:01',0,0,'MALE'),(2,'power sound bar','product-2.jpg',275.00,280.00,NULL,NULL,2,2,'power-sound-speaker',1,'2025-07-07 18:46:07','2025-12-23 16:30:01',0,0,'FEMALE'),(3,'Security Camera','product-3.jpg',399.00,0.00,NULL,NULL,3,3,'security-camera',1,'2025-07-07 18:46:07','2025-12-23 16:30:01',0,0,'FEMALE'),(4,'iphone 6x plus','product-4.jpg',400.00,0.00,NULL,NULL,4,4,'iphone-6x-plus',1,'2025-07-07 18:46:07','2025-12-23 16:30:01',0,0,'FEMALE'),(5,'Wireless Headphones','product-5.jpg',350.00,0.00,NULL,NULL,5,25,'wireless-headphones',1,'2025-07-07 18:46:07','2025-12-23 16:20:20',0,1,'MALE'),(6,'Mini Bluetooth Speaker','product-6.jpg',70.00,0.00,NULL,NULL,6,4,'mini-bluetooth-speaker',1,'2025-07-07 18:46:07','2025-12-23 16:30:01',0,0,'MALE'),(7,'PX& Wireless Headphones','product-7.jpg',100.00,0.00,'Space Gray Aluminum Case',NULL,5,3,'px-wireless-headphones',1,'2025-07-07 18:46:07','2025-12-23 16:30:01',0,0,'UNISEX'),(8,'Apple MacBook Air','product-8.jpg',90.00,280.00,'Apple Macbook','Apple Macbook long',4,2,'apple-macbook-air',1,'2025-07-07 18:46:07','2025-12-24 11:47:54',0,0,'UNISEX');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_feature_mapping`
--

DROP TABLE IF EXISTS `product_feature_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_feature_mapping` (
  `product_feature_mapping_id` int NOT NULL AUTO_INCREMENT,
  `product_auto_id` int NOT NULL,
  `feature_value` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_feature_mapping_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_feature_mapping`
--

LOCK TABLES `product_feature_mapping` WRITE;
/*!40000 ALTER TABLE `product_feature_mapping` DISABLE KEYS */;
INSERT INTO `product_feature_mapping` VALUES (9,8,'Capture 4K30 Video and 12MP Photos',1,'2025-12-22 17:34:52','2025-12-22 17:34:52'),(10,8,'Game-Style Controller with Touchscreen',1,'2025-12-22 17:34:52','2025-12-22 17:34:52');
/*!40000 ALTER TABLE `product_feature_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `product_image_auto_id` int NOT NULL AUTO_INCREMENT,
  `product_auto_id` int NOT NULL,
  `image` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_image_auto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (2,8,'product-5.jpg',1,1,1,'2025-12-23 15:41:29','2025-12-23 15:41:29'),(3,8,'product-2.jpg',1,1,1,'2025-12-23 15:41:29','2025-12-23 15:41:29');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_meta_data`
--

DROP TABLE IF EXISTS `product_meta_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_meta_data` (
  `product_meta_data_auto_id` int NOT NULL AUTO_INCREMENT,
  `product_auto_id` int NOT NULL,
  `meta_data` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_meta_data_auto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_meta_data`
--

LOCK TABLES `product_meta_data` WRITE;
/*!40000 ALTER TABLE `product_meta_data` DISABLE KEYS */;
INSERT INTO `product_meta_data` VALUES (1,8,'Apple Macbook.\n\nApple',1,1,1,'2025-12-23 15:39:55','2025-12-23 15:39:55'),(2,8,'Apple Macbook.  Apple1',1,1,1,'2025-12-23 15:39:55','2025-12-23 15:39:55');
/*!40000 ALTER TABLE `product_meta_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_specification_mapping`
--

DROP TABLE IF EXISTS `product_specification_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_specification_mapping` (
  `product_specification_mapping_id` int NOT NULL AUTO_INCREMENT,
  `product_auto_id` int NOT NULL,
  `specification_auto_id` int NOT NULL,
  `specification_value` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_specification_mapping_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_specification_mapping`
--

LOCK TABLES `product_specification_mapping` WRITE;
/*!40000 ALTER TABLE `product_specification_mapping` DISABLE KEYS */;
INSERT INTO `product_specification_mapping` VALUES (1,8,1,'35.5oz (1006g)',1,1,1,'2025-12-23 14:45:59','2025-12-23 14:45:59'),(2,8,2,'35 mph (15 m/s)',1,1,1,'2025-12-23 14:45:59','2025-12-23 14:45:59');
/*!40000 ALTER TABLE `product_specification_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productcategorymappings`
--

DROP TABLE IF EXISTS `productcategorymappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productcategorymappings` (
  `product_category_mapping_auto_id` int NOT NULL AUTO_INCREMENT,
  `product_auto_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `is_active` int DEFAULT '1',
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_category_mapping_auto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productcategorymappings`
--

LOCK TABLES `productcategorymappings` WRITE;
/*!40000 ALTER TABLE `productcategorymappings` DISABLE KEYS */;
INSERT INTO `productcategorymappings` VALUES (1,1,1,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:40:56'),(2,2,3,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:32:29'),(3,3,3,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:32:29'),(4,4,3,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:32:29'),(5,5,5,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:32:29'),(6,6,5,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:32:29'),(7,7,5,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:32:29'),(8,8,5,1,NULL,NULL,'2025-12-18 22:32:29','2025-12-18 22:32:29');
/*!40000 ALTER TABLE `productcategorymappings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productSectionMapping`
--

DROP TABLE IF EXISTS `productSectionMapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productSectionMapping` (
  `productSectionsAutoId` int NOT NULL AUTO_INCREMENT,
  `product_auto_Id` int DEFAULT NULL,
  `sectionId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`productSectionsAutoId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productSectionMapping`
--

LOCK TABLES `productSectionMapping` WRITE;
/*!40000 ALTER TABLE `productSectionMapping` DISABLE KEYS */;
INSERT INTO `productSectionMapping` VALUES (1,1,1,'2025-07-08 16:11:23','2025-07-08 16:11:23'),(2,2,1,'2025-07-08 16:11:23','2025-07-08 16:11:23'),(3,3,1,'2025-07-08 16:11:23','2025-07-08 16:11:23'),(4,4,1,'2025-07-08 16:11:23','2025-07-08 16:11:23'),(5,5,1,'2025-07-08 16:11:23','2025-07-08 16:11:23'),(6,6,1,'2025-07-08 16:11:23','2025-07-08 16:11:23'),(7,7,2,'2025-07-08 16:11:23','2025-07-08 17:29:04'),(8,8,2,'2025-07-08 16:11:23','2025-07-08 17:29:04');
/*!40000 ALTER TABLE `productSectionMapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `sectionsAutoId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sectionsAutoId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (1,'Trending','2025-07-08 16:10:49','2025-07-08 16:10:49'),(2,'New Arrival','2025-07-08 17:28:52','2025-07-08 17:28:52');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specification_master`
--

DROP TABLE IF EXISTS `specification_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specification_master` (
  `specification_auto_id` int NOT NULL AUTO_INCREMENT,
  `specification_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `updatedBy` int DEFAULT '1',
  `createdBy` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`specification_auto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specification_master`
--

LOCK TABLES `specification_master` WRITE;
/*!40000 ALTER TABLE `specification_master` DISABLE KEYS */;
INSERT INTO `specification_master` VALUES (1,'Weight',1,1,1,'2025-12-23 14:45:16','2025-12-23 14:45:16'),(2,'Maximum Speed',1,1,1,'2025-12-23 14:45:16','2025-12-23 14:45:16'),(3,'Maximum Distance',1,1,1,'2025-12-23 14:45:16','2025-12-23 14:45:16'),(4,'Operating Frequency',1,1,1,'2025-12-23 14:45:16','2025-12-23 14:45:16'),(5,'Manufacturer',1,1,1,'2025-12-23 14:45:16','2025-12-23 14:45:16');
/*!40000 ALTER TABLE `specification_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statemaster`
--

DROP TABLE IF EXISTS `statemaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statemaster` (
  `stateId` int NOT NULL AUTO_INCREMENT,
  `stateCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stateName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `countryId` int NOT NULL,
  `regionId` int NOT NULL,
  `createdBy` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedBy` int DEFAULT NULL,
  `updatedAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`stateId`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statemaster`
--

LOCK TABLES `statemaster` WRITE;
/*!40000 ALTER TABLE `statemaster` DISABLE KEYS */;
INSERT INTO `statemaster` VALUES (1,'AN','Andaman and Nicobar Islands',1,4,NULL,'2024-02-29 14:31:25.625',NULL,NULL,0),(2,'AP','Andhra Pradesh',1,4,NULL,'2024-02-29 14:31:25.625',NULL,NULL,0),(3,'AR','Arunachal Pradesh',1,5,NULL,'2024-02-29 14:31:25.626',NULL,NULL,0),(4,'AS','Assam',1,5,NULL,'2024-02-29 14:31:25.626',NULL,NULL,0),(5,'BR','Bihar',1,2,NULL,'2024-02-29 14:31:25.626',NULL,NULL,0),(6,'CH','Chandigarh',1,1,NULL,'2024-02-29 14:31:25.626',NULL,NULL,0),(7,'CT','Chhattisgarh',1,6,NULL,'2024-02-29 14:31:25.626',NULL,NULL,0),(8,'DN','Dadra and Nagar Haveli',1,3,NULL,'2024-02-29 14:31:25.627',NULL,NULL,0),(9,'DD','Daman and Diu',1,3,NULL,'2024-02-29 14:31:25.627',NULL,NULL,0),(10,'DL','Delhi',1,1,NULL,'2024-02-29 14:31:25.627',NULL,NULL,0),(11,'GA','Goa',1,3,NULL,'2024-02-29 14:31:25.627',NULL,NULL,0),(12,'GJ','Gujarat',1,3,NULL,'2024-02-29 14:31:25.627',NULL,NULL,0),(13,'HR','Haryana',1,1,NULL,'2024-02-29 14:31:25.627',NULL,NULL,0),(14,'HP','Himachal Pradesh',1,1,NULL,'2024-02-29 14:31:25.628',NULL,NULL,0),(15,'JK','Jammu & Kashmir',1,1,NULL,'2024-02-29 14:31:25.628',NULL,NULL,0),(16,'JH','Jharkhand',1,2,NULL,'2024-02-29 14:31:25.628',NULL,NULL,0),(17,'KA','Karnataka',1,4,NULL,'2024-02-29 14:31:25.628',NULL,NULL,0),(18,'KL','Kerala',1,4,NULL,'2024-02-29 14:31:25.628',NULL,NULL,0),(19,'LD','Lakshadweep',1,4,NULL,'2024-02-29 14:31:25.628',NULL,NULL,0),(20,'MP','Madhya Pradesh',1,6,NULL,'2024-02-29 14:31:25.629',NULL,NULL,0),(21,'MH','Maharashtra',1,3,NULL,'2024-02-29 14:31:25.629',NULL,NULL,0),(22,'MN','Manipur',1,5,NULL,'2024-02-29 14:31:25.629',NULL,NULL,0),(23,'ML','Meghalaya',1,5,NULL,'2024-02-29 14:31:25.629',NULL,NULL,0),(24,'MZ','Mizoram',1,5,NULL,'2024-02-29 14:31:25.629',NULL,NULL,0),(25,'NL','Nagaland',1,5,NULL,'2024-02-29 14:31:25.629',NULL,NULL,0),(26,'OR','Odisha',1,2,NULL,'2024-02-29 14:31:25.629',NULL,NULL,0),(27,'PY','Poducherry',1,1,NULL,'2024-02-29 14:31:25.630',NULL,NULL,0),(28,'PB','Punjab',1,1,NULL,'2024-02-29 14:31:25.630',NULL,NULL,0),(29,'RJ','Rajasthan',1,3,NULL,'2024-02-29 14:31:25.630',NULL,NULL,0),(30,'SK','Sikkim',1,2,NULL,'2024-02-29 14:31:25.630',NULL,NULL,0),(31,'TN','Tamil Nadu',1,4,NULL,'2024-02-29 14:31:25.630',NULL,NULL,0),(32,'TG','Telangana',1,4,NULL,'2024-02-29 14:31:25.630',NULL,NULL,0),(33,'TR','Tripura',1,5,NULL,'2024-02-29 14:31:25.631',NULL,NULL,0),(34,'UP','Uttar Pradesh',1,1,NULL,'2024-02-29 14:31:25.631',NULL,NULL,1),(35,'UT','Uttarakhand',1,1,NULL,'2024-02-29 14:31:25.631',NULL,NULL,0),(36,'WB','West Bengal',1,2,NULL,'2024-02-29 14:31:25.631',NULL,NULL,0);
/*!40000 ALTER TABLE `statemaster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usercart`
--

DROP TABLE IF EXISTS `usercart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usercart` (
  `usercartAutoId` int NOT NULL AUTO_INCREMENT,
  `userCookie` varchar(255) NOT NULL,
  `product_auto_id` int NOT NULL,
  `qty` int DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`usercartAutoId`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usercart`
--

LOCK TABLES `usercart` WRITE;
/*!40000 ALTER TABLE `usercart` DISABLE KEYS */;
/*!40000 ALTER TABLE `usercart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'yogendra.verma@teamcomputers.com','Yogi','Teams@123','2025-07-09 14:24:46','2025-08-11 13:14:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'kidsgamingzone'
--

--
-- Dumping routines for database 'kidsgamingzone'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-24 12:34:40
