import {
  uploadAttachmentService,
  getAttachmentDownloadUrlService,
  softDeleteAttachmentService,
} from '../services/taskAttachmentService.js';

const uploadAttachmentController=async (req, res, next)=>{
  try {
    const attachment=await uploadAttachmentService({
      taskId: Number(req.params.id),
      userId: req.userId,
      file: req.file,
    });

    return res.status(201).json({
      message: 'Attachment uploaded successfully',
      attachment,
    });
  } catch (error) {
    next(error);
  }
};

const downloadAttachmentController=async (req, res, next)=>{
  try {
    const url=await getAttachmentDownloadUrlService({
      attachmentId: Number(req.params.attachmentId),
      userId: req.userId,
    });
    return res.status(200).json({url});
  } catch (error) {
    return next(error);
  }
};


const deleteAttachmentController= async (req, res, next)=>{
  try {
    await softDeleteAttachmentService({
      attachmentId: Number(req.params.attachmentId),
      userId: req.userId,
    });

    return res.status(200).json({
      message: 'Attachment deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export {
  uploadAttachmentController,
  downloadAttachmentController,
  deleteAttachmentController,
};
