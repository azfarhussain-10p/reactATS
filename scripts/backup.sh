#!/bin/bash
# Automated backup script for ATS application

# Configuration
BACKUP_DIR="/backups"
DB_CONTAINER="ats-database"
DB_NAME="ats"
DB_USER="postgres"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup_log.txt"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log start
echo "Backup started at $(date)" >> $LOG_FILE

# Create database backup
echo "Creating database backup..." >> $LOG_FILE
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Database backup completed successfully: $BACKUP_FILE" >> $LOG_FILE
else
  echo "Database backup failed" >> $LOG_FILE
  exit 1
fi

# Backup uploaded files
echo "Backing up uploaded files..." >> $LOG_FILE
docker cp ats-api:/app/data "${BACKUP_DIR}/data_${DATE}"
if [ $? -eq 0 ]; then
  echo "File backup completed successfully" >> $LOG_FILE
  tar -czf "${BACKUP_DIR}/files_${DATE}.tar.gz" "${BACKUP_DIR}/data_${DATE}"
  rm -rf "${BACKUP_DIR}/data_${DATE}"
else
  echo "File backup failed" >> $LOG_FILE
fi

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..." >> $LOG_FILE
find $BACKUP_DIR -name "db_backup_*" -type f -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "files_*" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed at $(date)" >> $LOG_FILE
echo "-----------------------------------" >> $LOG_FILE

# Optional: Send backup to remote storage
# aws s3 cp $BACKUP_FILE s3://your-backup-bucket/ 