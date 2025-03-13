-- AlterTable
ALTER TABLE `user` MODIFY `profile_image` VARCHAR(191) NULL DEFAULT '/site/avatar.png',
    MODIFY `profile_banner` VARCHAR(191) NULL DEFAULT '/site/banner.png';
