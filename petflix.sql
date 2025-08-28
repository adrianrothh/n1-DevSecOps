-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: petflix
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `admcodigo` int(11) NOT NULL AUTO_INCREMENT,
  `admemail` varchar(50) NOT NULL,
  `admsenha` varchar(30) NOT NULL,
  PRIMARY KEY (`admcodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin@gmail.com','123');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `catcodigo` int(11) NOT NULL AUTO_INCREMENT,
  `catnome` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catnomenormal` varchar(50) NOT NULL,
  PRIMARY KEY (`catcodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (16,'Populares','populares'),(17,'Educando Gatos','educando_gatos'),(18,'Destaques','destaques'),(19,'Educando Cães','educando_caes');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forums`
--

DROP TABLE IF EXISTS `forums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forums` (
  `codtopico` int(11) NOT NULL AUTO_INCREMENT,
  `fortitulo` varchar(50) NOT NULL,
  `conteudo` text NOT NULL,
  `catforum` varchar(50) NOT NULL,
  `usucodigo` int(11) NOT NULL,
  `admcodigo` int(11) NOT NULL,
  `fordata` datetime NOT NULL,
  PRIMARY KEY (`codtopico`),
  KEY `usucodigo` (`usucodigo`),
  KEY `admcodigo` (`admcodigo`),
  CONSTRAINT `forums_ibfk_1` FOREIGN KEY (`usucodigo`) REFERENCES `usuarios` (`usucodigo`),
  CONSTRAINT `forums_ibfk_2` FOREIGN KEY (`admcodigo`) REFERENCES `admins` (`admcodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forums`
--

LOCK TABLES `forums` WRITE;
/*!40000 ALTER TABLE `forums` DISABLE KEYS */;
INSERT INTO `forums` VALUES (6,'teste','teste','Cuidados Pets',1,1,'2025-07-06 23:03:39'),(7,'teste2223232','terasfsdadfasgbdffsdgá','Geral',1,1,'2025-07-06 23:03:49');
/*!40000 ALTER TABLE `forums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forumsresposta`
--

DROP TABLE IF EXISTS `forumsresposta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forumsresposta` (
  `cod_resposta` int(11) NOT NULL AUTO_INCREMENT,
  `codtopico` int(11) NOT NULL,
  `usucodigo` int(11) NOT NULL,
  `admcodigo` int(11) NOT NULL,
  `conteudo` text DEFAULT NULL,
  `respdata` datetime DEFAULT NULL,
  PRIMARY KEY (`cod_resposta`),
  KEY `usucodigo` (`usucodigo`),
  KEY `admcodigo` (`admcodigo`),
  KEY `codtopico` (`codtopico`),
  CONSTRAINT `forumsresposta_ibfk_1` FOREIGN KEY (`usucodigo`) REFERENCES `usuarios` (`usucodigo`),
  CONSTRAINT `forumsresposta_ibfk_2` FOREIGN KEY (`admcodigo`) REFERENCES `admins` (`admcodigo`),
  CONSTRAINT `forumsresposta_ibfk_3` FOREIGN KEY (`codtopico`) REFERENCES `forums` (`codtopico`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forumsresposta`
--

LOCK TABLES `forumsresposta` WRITE;
/*!40000 ALTER TABLE `forumsresposta` DISABLE KEYS */;
INSERT INTO `forumsresposta` VALUES (4,7,1,1,'.çdz~]z]~çc´[zxcç!3\"@#$$#%','2025-07-06 23:04:01'),(5,7,16,1,'TEste1','2025-07-07 16:38:27');
/*!40000 ALTER TABLE `forumsresposta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pets`
--

DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pets` (
  `id_pet` int(11) NOT NULL AUTO_INCREMENT,
  `nome_pet` varchar(50) NOT NULL,
  `idade_pet` int(11) NOT NULL,
  `raca_pet` varchar(50) NOT NULL,
  `foto_pet` text DEFAULT NULL,
  `usucodigo` int(11) NOT NULL,
  PRIMARY KEY (`id_pet`),
  KEY `usucodigo` (`usucodigo`),
  CONSTRAINT `pets_ibfk_1` FOREIGN KEY (`usucodigo`) REFERENCES `usuarios` (`usucodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pets`
--

LOCK TABLES `pets` WRITE;
/*!40000 ALTER TABLE `pets` DISABLE KEYS */;
INSERT INTO `pets` VALUES (3,'joaocleber',222,'joaoclebeu',NULL,12),(19,'a3',123,'audi','1751847536750-309304618.png',1);
/*!40000 ALTER TABLE `pets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `usucodigo` int(11) NOT NULL AUTO_INCREMENT,
  `usuemail` char(50) NOT NULL,
  `ususenha` char(15) NOT NULL,
  PRIMARY KEY (`usucodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'gustavo@gmail.com','123'),(12,'joaocleber@gmail.com','123'),(15,'marcelo@gmail.com','123'),(16,'valerio@gmail.com','12345');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `videos` (
  `vidcodigo` int(11) NOT NULL AUTO_INCREMENT,
  `vidtitulo` char(60) NOT NULL,
  `viddescricao` text NOT NULL,
  `vidsinopse` text NOT NULL,
  `vidnota` decimal(4,2) NOT NULL DEFAULT 0.00,
  `vidbloqueado` tinyint(1) NOT NULL DEFAULT 0,
  `vidminiatura` varchar(30) NOT NULL,
  `viddataini` date NOT NULL,
  `viddatafim` date DEFAULT NULL,
  `catcodigo` int(11) NOT NULL,
  `vidarquivo` varchar(100) NOT NULL DEFAULT 'video.mp4',
  `vidcapa` varchar(100) NOT NULL,
  PRIMARY KEY (`vidcodigo`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (14,'24 HORAS COM CACHORRO MINI VS MÉDIO VS GIGANTE !!!','Créditos: @anninha no youtube','',0.00,0,'1751917737114-365371883.jpg','2025-07-07',NULL,18,'1751917736877-479499109.mp4','1751917737114-365371883.jpg'),(15,'Como Adestrar um Cachorro - 6 Comandos Básicos','Como Adestrar um Cachorro - 6 Comandos Básicos','',0.00,0,'1751917771864-448424491.jpg','2025-07-07',NULL,19,'1751917771741-417829192.mp4','1751917771864-448424491.jpg'),(16,'Como Ensinar um Cachorro a Sentar - Muito Fácil!!!','Como Ensinar um Cachorro a Sentar - Muito Fácil!!!','',0.00,0,'1751917862205-457184818.jpg','2025-07-07',NULL,19,'1751917862153-244313258.mp4','1751917862205-457184818.jpg'),(17,'Gatos mais engraçados - Compilado TENTE NÃO RIR','Quase tao bonito quanto o nosso grande professor manseira!','',0.00,0,'1751917939791-823226240.jpg','2025-07-07',NULL,17,'1751917939470-619377116.mp4','1751917939791-823226240.jpg'),(19,'Dicas Básicas para Cães - Senta - Fica - Bate Aqui e Deita','Dicas Básicas para Cães - Senta - Fica - Bate Aqui e Deita','',0.00,0,'1751918089051-340273785.png','2025-07-07',NULL,18,'1751918088993-834661515.mp4','1751918089051-340273785.png');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-07 23:35:16
