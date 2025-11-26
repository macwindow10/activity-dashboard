BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Project] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [ownerId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Project_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Project_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ProjectAssignee] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ProjectAssignee_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ProjectAssignee_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ProjectAssignee_projectId_userId_key] UNIQUE NONCLUSTERED ([projectId],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[Activity] (
    [id] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Activity_status_df] DEFAULT 'Created',
    [dueDate] DATETIME2 NOT NULL,
    [completionDate] DATETIME2,
    [createdById] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Activity_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Activity_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ActivityStatusHistory] (
    [id] NVARCHAR(1000) NOT NULL,
    [activityId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [remarks] NVARCHAR(1000),
    [changedById] NVARCHAR(1000) NOT NULL,
    [changedAt] DATETIME2 NOT NULL CONSTRAINT [ActivityStatusHistory_changedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ActivityStatusHistory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ActivityProject] (
    [id] NVARCHAR(1000) NOT NULL,
    [activityId] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ActivityProject_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ActivityProject_activityId_projectId_key] UNIQUE NONCLUSTERED ([activityId],[projectId])
);

-- CreateTable
CREATE TABLE [dbo].[ActivityPerson] (
    [id] NVARCHAR(1000) NOT NULL,
    [activityId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ActivityPerson_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ActivityPerson_activityId_userId_key] UNIQUE NONCLUSTERED ([activityId],[userId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Project_ownerId_idx] ON [dbo].[Project]([ownerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ProjectAssignee_projectId_idx] ON [dbo].[ProjectAssignee]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ProjectAssignee_userId_idx] ON [dbo].[ProjectAssignee]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activity_createdById_idx] ON [dbo].[Activity]([createdById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activity_dueDate_idx] ON [dbo].[Activity]([dueDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Activity_status_idx] ON [dbo].[Activity]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityStatusHistory_activityId_idx] ON [dbo].[ActivityStatusHistory]([activityId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityStatusHistory_changedById_idx] ON [dbo].[ActivityStatusHistory]([changedById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityStatusHistory_status_idx] ON [dbo].[ActivityStatusHistory]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityStatusHistory_changedAt_idx] ON [dbo].[ActivityStatusHistory]([changedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityProject_activityId_idx] ON [dbo].[ActivityProject]([activityId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityProject_projectId_idx] ON [dbo].[ActivityProject]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityPerson_activityId_idx] ON [dbo].[ActivityPerson]([activityId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ActivityPerson_userId_idx] ON [dbo].[ActivityPerson]([userId]);

-- AddForeignKey
ALTER TABLE [dbo].[Project] ADD CONSTRAINT [Project_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ProjectAssignee] ADD CONSTRAINT [ProjectAssignee_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProjectAssignee] ADD CONSTRAINT [ProjectAssignee_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Activity] ADD CONSTRAINT [Activity_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ActivityStatusHistory] ADD CONSTRAINT [ActivityStatusHistory_changedById_fkey] FOREIGN KEY ([changedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ActivityStatusHistory] ADD CONSTRAINT [ActivityStatusHistory_activityId_fkey] FOREIGN KEY ([activityId]) REFERENCES [dbo].[Activity]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ActivityProject] ADD CONSTRAINT [ActivityProject_activityId_fkey] FOREIGN KEY ([activityId]) REFERENCES [dbo].[Activity]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ActivityProject] ADD CONSTRAINT [ActivityProject_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ActivityPerson] ADD CONSTRAINT [ActivityPerson_activityId_fkey] FOREIGN KEY ([activityId]) REFERENCES [dbo].[Activity]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ActivityPerson] ADD CONSTRAINT [ActivityPerson_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
