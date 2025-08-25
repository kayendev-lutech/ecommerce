import { ImageUploadProcessor } from './processors/image-upload.processor';

export const queueRegistry = [
  {
    name: 'image-upload',
    processor: new ImageUploadProcessor(),
    handler: (processor: ImageUploadProcessor) => processor.processUploadImageJob.bind(processor),
  },
  // add another queue
];
