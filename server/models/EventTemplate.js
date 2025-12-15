import mongoose from 'mongoose';

const overrideSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  title: String,
  description: String,
  cost: String,
  time: String,
  location: {
    lat: Number,
    lng: Number
  }
}, { _id: false });

const eventTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  cost: {
    type: String,
    trim: true
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true
  },
  language: {
    type: String,
    enum: ['he', 'en'],
    required: true,
    default: 'he'
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  repeatDays: {
    type: [Number],
    validate: {
      validator: function(days) {
        // Only validate if repeat is weekly
        if (this.repeat === 'weekly') {
          return days && days.length > 0 && days.every(d => d >= 0 && d <= 6);
        }
        return true;
      },
      message: 'repeatDays must contain valid day numbers (0-6) when repeat is weekly'
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    min: 1,
    max: 24
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  locationName: {
    type: String,
    trim: true
  },
  venue: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['underReview', 'approved', 'rejected'],
    default: 'underReview'
  },
  rsvps: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  overrides: [overrideSchema]
}, {
  timestamps: true
});

// Validate that endDate is after startDate
eventTemplateSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    next(new Error('endDate must be after startDate'));
  } else {
    next();
  }
});

export default mongoose.model('EventTemplate', eventTemplateSchema);
