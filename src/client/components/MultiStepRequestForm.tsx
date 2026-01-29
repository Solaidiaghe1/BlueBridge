import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, DateData } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { z } from 'zod';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { colors, spacing, borderRadius, typography } from '../../shared/theme';
import { useAuth } from '@clerk/clerk-expo';
import { createAuthedSupabaseClient } from '../../config/supabase';

// US States list
const US_STATES = [
  { label: 'Select State', value: '' },
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

// Zod validation schema for address
const addressSchema = z.object({
  streetAddress: z.string()
    .min(1, 'Street address is required')
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address must be less than 100 characters'),
  
  apt: z.string().optional().or(z.literal('')),
  
  city: z.string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'City can only contain letters, spaces, hyphens, and apostrophes'),
  
  state: z.string()
    .min(1, 'Please select a state')
    .refine((val) => val !== '', 'Please select a state'),
  
  zipCode: z.string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}$/, 'ZIP code must be exactly 5 digits'),
  
  locationType: z.string()
    .min(1, 'Please select a location type'),
});

interface MultiStepRequestFormProps {
  visible: boolean;
  onClose: () => void;
  serviceType: string;
  onSubmit: (data: any) => void;
}

interface FormData {
  title: string;
  description: string;
  photos: string[];
  videos: string[];
  useSavedAddress: boolean;
  saveAddress: boolean;
  selectedSavedAddressId: string | null;
  streetAddress: string;
  apt: string;
  city: string;
  state: string;
  zipCode: string;
  locationType: string;
  scheduling: 'asap' | '24-48' | 'schedule';
  scheduledDates: { [key: string]: string[] }; // date -> array of time slots
  petsOnSite: boolean | null;
  parkingNotes: string;
  measurements: string;
  inspectionFee: number;
  paymentMethod: 'apple-pay' | 'saved-card';
}

export const MultiStepRequestForm: React.FC<MultiStepRequestFormProps> = ({
  visible,
  onClose,
  serviceType,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    photos: [],
    videos: [],
    useSavedAddress: false,
    saveAddress: false,
    selectedSavedAddressId: null,
    streetAddress: '',
    apt: '',
    city: '',
    state: '',
    zipCode: '',
    locationType: '',
    scheduling: 'asap',
    scheduledDates: {},
    petsOnSite: null,
    parkingNotes: '',
    measurements: '',
    inspectionFee: 19,
    paymentMethod: 'apple-pay',
  });

  const totalSteps = 7;
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  const handleNext = () => {
    // Step 1 validation with specific warnings
    if (currentStep === 1) {
      if (formData.title.trim().length < 5) {
        Alert.alert(
          'Issue Too Short',
          'Please provide at least 5 characters for the issue description.',
          [{ text: 'OK' }]
        );
        return;
      }
      if (formData.description.trim().length < 20) {
        Alert.alert(
          'Description Too Short',
          'Please provide at least 20 characters in the description to help service providers understand your needs.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length >= 5 && formData.description.trim().length >= 20;
      case 2: {
        // Require at least one video to continue
        const videosArr = (formData.videos ?? []) as any[];
        return videosArr.length > 0;
      }
      case 3:
        // Validate address using Zod schema
        try {
          addressSchema.parse({
            streetAddress: formData.streetAddress,
            apt: formData.apt || undefined,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            locationType: formData.locationType,
          });
          return true;
        } catch (error) {
          return false;
        }
      case 4: {
        // Require availability to be filled in
        const dates = Object.keys(formData.scheduledDates ?? {});
        const hasAtLeastOneSlot = dates.some((date) => (formData.scheduledDates?.[date]?.length ?? 0) > 0);
        return dates.length > 0 && hasAtLeastOneSlot;
      }
      case 5:
        return true; // All optional
      case 6:
        return formData.paymentMethod !== null && formData.paymentMethod !== undefined;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1TitleDescription formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2PhotosVideos formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Address formData={formData} updateFormData={updateFormData} setFormData={setFormData} addressErrors={addressErrors} setAddressErrors={setAddressErrors} />;
      case 4:
        return <Step4Scheduling formData={formData} updateFormData={updateFormData} setFormData={setFormData} />;
      case 5:
        return <Step5AdditionalInfo formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6Payment formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <Step7Review formData={formData} serviceType={serviceType} />;
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Request
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
            <Text style={styles.progressPercentage}>{progressPercentage}% Complete</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Step Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, !isStepValid() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Submit Request' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Step 1: Issue & Description
const Step1TitleDescription: React.FC<any> = ({ formData, updateFormData }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Add your issue and description</Text>
    
    <View style={styles.formSection}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>1. Issue</Text>
        <Text style={styles.charLimit}>Min 5 characters</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Ex. Leaking kitchen sink"
        placeholderTextColor={colors.gray400}
        value={formData.title}
        onChangeText={(text) => {
          if (text.length <= 50) {
            updateFormData('title', text);
          }
        }}
        maxLength={50}
      />
      <Text style={styles.charCount}>{formData.title.length}/50</Text>
    </View>

    <View style={styles.formSection}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>2. Add Description</Text>
        <Text style={styles.charLimit}>Min 20 characters</Text>
      </View>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ex. The pipe under the kitchen sink has been leaking for 3 days. Water pools under the cabinet. I turned off the water supply temporarily."
        placeholderTextColor={colors.gray400}
        value={formData.description}
        onChangeText={(text) => {
          if (text.length <= 500) {
            updateFormData('description', text);
          }
        }}
        maxLength={500}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{formData.description.length}/500</Text>
    </View>
  </View>
);

// Step 2: Photos & Videos
const Step2PhotosVideos: React.FC<any> = ({ formData, updateFormData }) => {
  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow photo library access to upload photos/videos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickPhotos = async () => {
    const allowed = await requestLibraryPermission();
    if (!allowed) return;

    const remaining = Math.max(0, 5 - (formData.photos?.length ?? 0));
    if (remaining === 0) {
      Alert.alert('Limit reached', 'You can upload up to 5 photos.', [{ text: 'OK' }]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 0.85,
    });

    if (result.canceled) return;
    const uris = (result.assets ?? []).map((a) => a.uri).filter(Boolean);
    updateFormData('photos', [...(formData.photos ?? []), ...uris]);
  };

  const pickVideo = async () => {
    const allowed = await requestLibraryPermission();
    if (!allowed) return;

    const remaining = Math.max(0, 2 - (formData.videos?.length ?? 0));
    if (remaining === 0) {
      Alert.alert('Limit reached', 'You can upload up to 2 videos.', [{ text: 'OK' }]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const firstAsset = result.assets?.[0];
    const uri = firstAsset?.uri;

    if (!uri) {
      Alert.alert(
        'Video not selected',
        'We could not read the selected video. Please try selecting a different video (shorter file), or try again after restarting the app.',
        [{ text: 'OK' }]
      );
      return;
    }

    let thumbnailUri: string | null = null;
    try {
      const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, { time: 0 });
      thumbnailUri = thumbUri ?? null;
    } catch {
      thumbnailUri = null;
    }

    const fileName = (() => {
      try {
        return firstAsset?.fileName || uri.split('/').pop() || 'video.mp4';
      } catch {
        return 'video.mp4';
      }
    })();

    const videoItem = { uri, thumbnailUri, fileName };

    const existing = (formData.videos ?? []) as any[];
    const withoutDupes = existing.filter((v) => (typeof v === 'string' ? v !== uri : v?.uri !== uri));
    updateFormData('videos', [...withoutDupes, videoItem]);
  };

  const removePhoto = (uri: string) => {
    updateFormData(
      'photos',
      (formData.photos ?? []).filter((p: string) => p !== uri)
    );
  };

  const removeVideo = (uri: string) => {
    updateFormData(
      'videos',
      (formData.videos ?? []).filter((v: any) => (typeof v === 'string' ? v !== uri : v?.uri !== uri))
    );
  };

  const photoCount = formData.photos?.length ?? 0;
  const videosArr = (formData.videos ?? []) as any[];
  const videoCount = videosArr.length;

  const getVideoDisplayName = (uri: string) => {
    try {
      const last = uri.split('/').pop();
      return last || 'video.mp4';
    } catch {
      return 'video.mp4';
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add videos or photos</Text>
      <Text style={styles.stepSubtitle}>
        Help service providers understand your needs better (optional)
      </Text>

      <View style={styles.formSection}>
        <View style={styles.mediaHeaderRow}>
          <Text style={styles.label}>Photos (up to 5)</Text>
          <Text style={styles.mediaCountText}>{photoCount}/5</Text>
        </View>

        {photoCount === 0 ? (
          <TouchableOpacity style={styles.uploadBox} onPress={pickPhotos}>
            <Text style={styles.uploadIcon}>↑</Text>
            <Text style={styles.uploadText}>Tap to choose photos</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.photoGrid}>
            {(formData.photos ?? []).map((uri: string) => (
              <View key={uri} style={styles.photoThumbWrap}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  onPress={() => removePhoto(uri)}
                  style={styles.thumbRemoveBadge}
                >
                  <Text style={styles.thumbRemoveBadgeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {photoCount < 5 && (
              <TouchableOpacity
                style={styles.mediaAddTile}
                onPress={pickPhotos}
                accessibilityLabel="Add more photos"
              >
                <Text style={styles.mediaAddTilePlus}>＋</Text>
                <Text style={styles.mediaAddTileText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.formSection}>
        <View style={styles.mediaHeaderRow}>
          <Text style={styles.label}>Videos (up to 2)</Text>
          <Text style={styles.mediaCountText}>{videoCount}/2</Text>
        </View>

        {videoCount === 0 ? (
          <TouchableOpacity style={styles.uploadBox} onPress={pickVideo}>
            <Text style={styles.uploadIcon}>↑</Text>
            <Text style={styles.uploadText}>Tap to choose a video</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.videoGrid}>
            {videosArr.map((v: any, idx: number) => {
              const uri = typeof v === 'string' ? v : v?.uri;
              const thumbnailUri = typeof v === 'string' ? null : v?.thumbnailUri;
              const fileName =
                typeof v === 'string'
                  ? getVideoDisplayName(uri)
                  : (v?.fileName ?? getVideoDisplayName(uri));

              return (
                <View key={`${uri}-${idx}`} style={styles.videoTile}>
                  {thumbnailUri ? (
                    <Image source={{ uri: thumbnailUri }} style={styles.videoThumb} />
                  ) : (
                    <View style={styles.videoTileInner}>
                      <Text style={styles.videoTileName} numberOfLines={2}>
                        {fileName}
                      </Text>
                    </View>
                  )}

                  <View style={styles.videoPlayBadge}>
                    <Text style={styles.videoPlayBadgeText}>▶</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => uri && removeVideo(uri)}
                    style={styles.thumbRemoveBadge}
                  >
                    <Text style={styles.thumbRemoveBadgeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {videoCount < 2 && (
              <TouchableOpacity
                style={styles.mediaAddTile}
                onPress={pickVideo}
                accessibilityLabel="Add another video"
              >
                <Text style={styles.mediaAddTilePlus}>＋</Text>
                <Text style={styles.mediaAddTileText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Step 3: Address
const Step3Address: React.FC<any> = ({ formData, updateFormData, setFormData, addressErrors, setAddressErrors }) => {
  const { getToken } = useAuth();
  const [isLoadingSavedAddresses, setIsLoadingSavedAddresses] = React.useState(false);
  const [savedAddresses, setSavedAddresses] = React.useState<any[]>([]);
  const [hasLoadedSavedAddresses, setHasLoadedSavedAddresses] = React.useState(false);
  const [showStatePicker, setShowStatePicker] = React.useState(false);

  const hasSavedAddress = savedAddresses.length > 0;

  React.useEffect(() => {
    if (hasLoadedSavedAddresses) return;
    let isMounted = true;
    const load = async () => {
      try {
        setIsLoadingSavedAddresses(true);
        const token = await getToken({ template: 'supabase' });
        if (!token) {
          if (isMounted) setSavedAddresses([]);
          return;
        }

        const authed = createAuthedSupabaseClient(token);
        const { data, error } = await authed
          .from('addresses')
          .select('id,label,street_address,apt_suite_unit,city,state,zip_code,is_default,created_at')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) setSavedAddresses(data ?? []);
      } catch (e) {
        console.warn('Failed to load saved addresses:', e);
        if (isMounted) setSavedAddresses([]);
      } finally {
        if (isMounted) {
          setIsLoadingSavedAddresses(false);
          setHasLoadedSavedAddresses(true);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [getToken, hasLoadedSavedAddresses]);

  const normalizeLocationTypeFromLabel = (label: string | null | undefined): string => {
    const raw = String(label ?? '').trim();
    if (!raw) return '';
    const allowed = ['Home', 'Apartment', 'Office', 'Condo', 'Townhouse', 'Commercial Building', 'Other'];
    const match = allowed.find((t) => t.toLowerCase() === raw.toLowerCase());
    return match ?? 'Other';
  };

  // Helper function to safely extract string value
  const getStringValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return value.street || value.address || value.value || '';
    }
    return '';
  };

  const formatSavedAddress = (addr: any) => {
    const parts = [
      addr.street_address,
      addr.apt_suite_unit,
      addr.city,
      addr.state,
      addr.zip_code,
    ].filter(Boolean);
    return `${addr.label}: ${parts.join(', ')}`;
  };

  // Validate individual field
  const validateField = (field: string, value: any) => {
    try {
      const fieldSchema = addressSchema.pick({ [field]: true } as any);
      fieldSchema.parse({ [field]: value });
      // Clear error for this field
      setAddressErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setAddressErrors((prev: Record<string, string>) => ({
          ...prev,
          [field]: error.issues[0].message
        }));
      }
    }
  };

  const handleStateSelect = (stateValue: string) => {
    updateFormData('state', stateValue);
    validateField('state', stateValue);
    setShowStatePicker(false);
  };

  const getStateLabel = (stateValue: string) => {
    const state = US_STATES.find(s => s.value === stateValue);
    return state ? state.label : 'Select State';
  };

  const handleUseSavedAddress = () => {
    const newValue = !formData.useSavedAddress;

    if (newValue) {
      const addr = savedAddresses[0];
      if (!addr) return;

      setFormData({
        ...formData,
        useSavedAddress: true,
        selectedSavedAddressId: addr.id,
        streetAddress: addr.street_address ?? '',
        apt: addr.apt_suite_unit ?? '',
        city: addr.city ?? '',
        state: addr.state ?? '',
        zipCode: addr.zip_code ?? '',
        locationType: normalizeLocationTypeFromLabel(addr.label),
        // cannot "save" an address that is already saved
        saveAddress: false,
      });
      setAddressErrors({});
    } else {
      setFormData({
        ...formData,
        useSavedAddress: false,
        selectedSavedAddressId: null,
        streetAddress: '',
        apt: '',
        city: '',
        state: '',
        zipCode: '',
        locationType: '',
      });
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Where is the service needed?</Text>

      {hasSavedAddress && (
        <TouchableOpacity
          style={styles.useSavedAddressButton}
          onPress={handleUseSavedAddress}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.useSavedAddress && styles.checkboxChecked]}>
            {formData.useSavedAddress && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.useSavedAddressText}>
            {isLoadingSavedAddresses
              ? 'Loading saved addresses...'
              : `Use saved address (${formatSavedAddress(savedAddresses[0])})`}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.formSection}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={[styles.input, addressErrors.streetAddress && styles.inputError]}
          placeholder="123 Main Street"
          placeholderTextColor={colors.gray400}
          value={formData.streetAddress}
          onChangeText={(text) => updateFormData('streetAddress', text)}
          onBlur={() => validateField('streetAddress', formData.streetAddress)}
          editable={!formData.useSavedAddress}
        />
        {addressErrors.streetAddress && (
          <Text style={styles.errorText}>{addressErrors.streetAddress}</Text>
        )}
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Apt/Suite/Unit (optional)</Text>
        <TextInput
          style={[styles.input, addressErrors.apt && styles.inputError]}
          placeholder="Apt 4B"
          placeholderTextColor={colors.gray400}
          value={formData.apt}
          onChangeText={(text) => updateFormData('apt', text)}
          editable={!formData.useSavedAddress}
        />
        {addressErrors.apt && (
          <Text style={styles.errorText}>{addressErrors.apt}</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.formSection, { flex: 1 }]}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={[styles.input, addressErrors.city && styles.inputError]}
            placeholder="San Francisco"
            placeholderTextColor={colors.gray400}
            value={formData.city}
            onChangeText={(text) => updateFormData('city', text)}
            onBlur={() => validateField('city', formData.city)}
            editable={!formData.useSavedAddress}
          />
          {addressErrors.city && (
            <Text style={styles.errorText}>{addressErrors.city}</Text>
          )}
        </View>
        <View style={[styles.formSection, { flex: 1 }]}>
          <Text style={styles.label}>State</Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.statePickerButton,
              addressErrors.state && styles.inputError,
              !formData.useSavedAddress && styles.statePickerButtonActive
            ]}
            onPress={() => !formData.useSavedAddress && setShowStatePicker(true)}
            disabled={formData.useSavedAddress}
          >
            <Text style={[
              styles.statePickerText,
              !formData.state && styles.statePickerPlaceholder
            ]}>
              {formData.state || 'Select State'}
            </Text>
            <Feather name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {addressErrors.state && (
            <Text style={styles.errorText}>{addressErrors.state}</Text>
          )}
        </View>
      </View>

      {/* State Picker Modal */}
      <Modal
        visible={showStatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.stateModalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatePicker(false)}
        >
          <View style={styles.stateModalContent}>
            <View style={styles.stateModalHeader}>
              <Text style={styles.stateModalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.statesList}>
              {US_STATES.filter(state => state.value !== '').map((state) => (
                <TouchableOpacity
                  key={state.value}
                  style={[
                    styles.stateOption,
                    formData.state === state.value && styles.stateOptionSelected
                  ]}
                  onPress={() => handleStateSelect(state.value)}
                >
                  <Text style={[
                    styles.stateOptionText,
                    formData.state === state.value && styles.stateOptionTextSelected
                  ]}>
                    {state.label}
                  </Text>
                  {formData.state === state.value && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.formSection}>
        <Text style={styles.label}>ZIP Code</Text>
        <TextInput
          style={[styles.input, addressErrors.zipCode && styles.inputError]}
          placeholder="94102"
          placeholderTextColor={colors.gray400}
          value={formData.zipCode}
          onChangeText={(text) => updateFormData('zipCode', text)}
          onBlur={() => validateField('zipCode', formData.zipCode)}
          keyboardType="number-pad"
          maxLength={5}
          editable={!formData.useSavedAddress}
        />
        {addressErrors.zipCode && (
          <Text style={styles.errorText}>{addressErrors.zipCode}</Text>
        )}
      </View>

      {/* Save this address checkbox - only show when NOT using saved address */}
      {!formData.useSavedAddress && (
        <View>
          <TouchableOpacity
            style={styles.saveAddressRow}
            onPress={() => {
              const newValue = !formData.saveAddress;
              updateFormData('saveAddress', newValue);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, formData.saveAddress && styles.checkboxChecked]}>
              {formData.saveAddress && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.saveAddressText}>Save this address for future requests</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formSection}>
        <Text style={styles.label}>Location Type</Text>
        <View style={styles.pickerContainer}>
          {['Home', 'Apartment', 'Office', 'Condo', 'Townhouse', 'Commercial Building', 'Other'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                formData.locationType === type && styles.optionButtonSelected,
              ]}
              onPress={() => {
                updateFormData('locationType', type);
                validateField('locationType', type);
              }}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  formData.locationType === type && styles.optionButtonTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {addressErrors.locationType && (
          <Text style={styles.errorText}>{addressErrors.locationType}</Text>
        )}
      </View>
    </View>
  );
};

// Step 4: Scheduling
const Step4Scheduling: React.FC<any> = ({ formData, updateFormData, setFormData }) => {
  const [selectedDates, setSelectedDates] = useState<string[]>(
    Object.keys(formData.scheduledDates || {})
  );
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const timeSlots = [
    { label: 'Morning', value: 'morning', timeRange: '8am–12pm' },
    { label: 'Afternoon', value: 'afternoon', timeRange: '12pm–4pm' },
    { label: 'Evening', value: 'evening', timeRange: '4pm–8pm' },
  ];

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;

    if (selectedDates.includes(dateString)) {
      // Remove date
      const newDates = selectedDates.filter((d: string) => d !== dateString);
      setSelectedDates(newDates);

      // Remove from scheduledDates and expandedDates
      const newScheduledDates = { ...formData.scheduledDates };
      delete newScheduledDates[dateString];
      updateFormData('scheduledDates', newScheduledDates);

      const newExpanded = new Set(expandedDates);
      newExpanded.delete(dateString);
      setExpandedDates(newExpanded);
    } else {
      // Add date (limit to 7 days)
      if (selectedDates.length < 7) {
        const newDates = [...selectedDates, dateString].sort();
        setSelectedDates(newDates);

        // Initialize with morning and afternoon pre-selected
        updateFormData('scheduledDates', {
          ...formData.scheduledDates,
          [dateString]: ['morning', 'afternoon'],
        });

        // Auto-expand the newly added date
        const newExpanded = new Set(expandedDates);
        newExpanded.add(dateString);
        setExpandedDates(newExpanded);
      }
    }
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (expandedDates.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const handleTimeSlotToggle = (date: string, slotValue: string) => {
    const currentSlots = formData.scheduledDates[date] || [];
    let newSlots: string[];

    if (currentSlots.includes(slotValue)) {
      newSlots = currentSlots.filter((s: string) => s !== slotValue);
    } else {
      newSlots = [...currentSlots, slotValue];
    }

    updateFormData('scheduledDates', {
      ...formData.scheduledDates,
      [date]: newSlots,
    });
  };

  const getShortDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Create markedDates object for calendar
  const markedDates = selectedDates.reduce((acc: any, date: string) => {
    acc[date] = {
      selected: true,
      selectedColor: colors.primary,
    };
    return acc;
  }, {} as any);

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select your availability for an inspection</Text>
      <Text style={styles.stepSubtitle}>Choose up to 7 days you're available</Text>

      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: colors.white,
          calendarBackground: colors.white,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.white,
          todayTextColor: colors.primary,
          dayTextColor: colors.textPrimary,
          textDisabledColor: colors.gray300,
          dotColor: colors.primary,
          selectedDotColor: colors.white,
          arrowColor: colors.primary,
          monthTextColor: colors.textPrimary,
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
        }}
        minDate={minDate}
        maxDate={maxDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        hideExtraDays={true}
      />

      {selectedDates.length > 0 && (
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.sectionLabel}>Time slots for selected days</Text>

          {selectedDates.map((date: string) => {
            const isExpanded = expandedDates.has(date);
            const selectedSlots = formData.scheduledDates[date] || [];

            return (
              <View key={date} style={styles.dayScheduleCard}>
                <TouchableOpacity
                  style={styles.dayHeader}
                  onPress={() => toggleDateExpansion(date)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayLabel}>{getShortDate(date)}</Text>
                  <View style={styles.dayHeaderRight}>
                    <Text style={styles.selectedSlotsCount}>
                      {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
                    </Text>
                    <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.timeSlotsList}>
                    {timeSlots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.value);

                      return (
                        <TouchableOpacity
                          key={slot.value}
                          style={[
                            styles.timeSlotCheckbox,
                            isSelected && styles.timeSlotCheckboxSelected,
                          ]}
                          onPress={() => handleTimeSlotToggle(date, slot.value)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxChecked,
                            ]}
                          >
                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <View style={styles.timeSlotInfo}>
                            <Text
                              style={[
                                styles.timeSlotLabel,
                                isSelected && styles.timeSlotLabelSelected,
                              ]}
                            >
                              {slot.label}
                            </Text>
                            <Text style={styles.timeSlotRange}>({slot.timeRange})</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// Step 5: Additional Information
const Step5AdditionalInfo: React.FC<any> = ({ formData, updateFormData }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Additional information</Text>
    <Text style={styles.stepSubtitle}>Help us serve you better (all optional)</Text>

    <View style={styles.formSection}>
      <Text style={styles.label}>Pets on Site?</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.yesNoButton,
            formData.petsOnSite === true && styles.yesNoButtonSelected,
          ]}
          onPress={() => updateFormData('petsOnSite', true)}
        >
          <Text style={styles.yesNoButtonText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.yesNoButton,
            formData.petsOnSite === false && styles.yesNoButtonSelected,
          ]}
          onPress={() => updateFormData('petsOnSite', false)}
        >
          <Text style={styles.yesNoButtonText}>No</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.formSection}>
      <Text style={styles.label}>Parking Notes</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex. Street parking available. Visitor spot #12 in garage."
        placeholderTextColor={colors.gray400}
        value={formData.parkingNotes}
        onChangeText={(text) => updateFormData('parkingNotes', text)}
      />
    </View>
  </View>
);

// Step 6: Payment
const Step6Payment: React.FC<any> = ({ formData, updateFormData }) => {
  const subtotal = formData.inspectionFee;
  const serviceFee = 2.99;
  const total = subtotal + serviceFee;

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment summary</Text>
      <Text style={styles.stepSubtitle}>Review charges and select payment method</Text>

      {/* Receipt-style breakdown */}
      <View style={styles.receiptContainer}>
        <View style={styles.receiptHeader}>
          <Text style={styles.receiptHeaderText}>PRICE BREAKDOWN</Text>
        </View>
        
        <View style={styles.receiptBody}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Inspection Fee</Text>
            <Text style={styles.receiptValue}>${subtotal.toFixed(2)}</Text>
          </View>


          <View style={styles.receiptDivider} />

          <View style={styles.receiptRowTotal}>
            <Text style={styles.receiptLabelTotal}>Total Amount</Text>
            <Text style={styles.receiptValueTotal}>${total.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.receiptFooter}>
          <Text style={styles.receiptFooterText}>ⓘ You'll only be charged after service completion</Text>
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.formSection}>
        <Text style={styles.label}>Payment Method</Text>
        <Text style={styles.sublabel}>Choose how you'd like to pay</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            formData.paymentMethod === 'apple-pay' && styles.paymentOptionSelected,
          ]}
          onPress={() => updateFormData('paymentMethod', 'apple-pay')}
        >
          <View style={styles.applePayIcon}>
            <Text style={styles.appleIcon}></Text>
          </View>
          <Text style={styles.paymentOptionText}>Apple Pay</Text>
          {formData.paymentMethod === 'apple-pay' && (
            <View style={styles.checkmarkCircle}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            formData.paymentMethod === 'saved-card' && styles.paymentOptionSelected,
          ]}
          onPress={() => updateFormData('paymentMethod', 'saved-card')}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.cardEmoji}>⬜</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.paymentOptionText}>Saved Card</Text>
            <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
          </View>
          {formData.paymentMethod === 'saved-card' && (
            <View style={styles.checkmarkCircle}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Step 7: Review
const Step7Review: React.FC<any> = ({ formData, serviceType }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const getTimeSlotLabel = (slotValue: string): string => {
    const timeSlots = {
      morning: 'Morning (8–12)',
      afternoon: 'Afternoon (12–4)',
      evening: 'Evening (4–8)',
    };
    return timeSlots[slotValue as keyof typeof timeSlots] || slotValue;
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review your request</Text>
      <Text style={styles.stepSubtitle}>Make sure everything looks good before submitting</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Request Details</Text>
        <Text style={styles.reviewLabel}>Title: <Text style={styles.reviewValue}>{formData.title}</Text></Text>
        <Text style={styles.reviewLabel}>Description: <Text style={styles.reviewValue}>{formData.description}</Text></Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Location</Text>
        <Text style={styles.reviewValue}>
          {formData.streetAddress}{formData.apt ? `, ${formData.apt}` : ''}
        </Text>
        <Text style={styles.reviewValue}>
          {formData.city}, {formData.state} {formData.zipCode}
        </Text>
        <Text style={styles.reviewLabel}>Type: <Text style={styles.reviewValue}>{formData.locationType}</Text></Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Availability</Text>
        {Object.keys(formData.scheduledDates).length > 0 ? (
          Object.keys(formData.scheduledDates).sort().map((date) => {
            const slots = formData.scheduledDates[date];
            return (
              <View key={date} style={styles.reviewDateItem}>
                <Text style={styles.reviewLabel}>{formatDate(date)}</Text>
                {slots.map((slot: string) => (
                  <Text key={slot} style={styles.reviewValue}>
                    • {getTimeSlotLabel(slot)}
                  </Text>
                ))}
              </View>
            );
          })
        ) : (
          <Text style={styles.reviewValue}>No dates selected</Text>
        )}
      </View>

      {(formData.petsOnSite !== null || formData.parkingNotes || formData.measurements) && (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewSectionTitle}>Additional Information</Text>
          {formData.petsOnSite !== null && (
            <Text style={styles.reviewLabel}>
              Pets on Site: <Text style={styles.reviewValue}>{formData.petsOnSite ? 'Yes' : 'No'}</Text>
            </Text>
          )}
          {formData.parkingNotes && (
            <Text style={styles.reviewLabel}>
              Parking: <Text style={styles.reviewValue}>{formData.parkingNotes}</Text>
            </Text>
          )}
          {formData.measurements && (
            <Text style={styles.reviewLabel}>
              Measurements: <Text style={styles.reviewValue}>{formData.measurements}</Text>
            </Text>
          )}
        </View>
      )}

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSectionTitle}>Payment</Text>
        <Text style={styles.reviewLabel}>
          Inspection Fee: <Text style={styles.reviewValue}>${formData.inspectionFee}</Text>
        </Text>
        <Text style={styles.reviewLabel}>
          Payment Method: <Text style={styles.reviewValue}>
            {formData.paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Saved Card (•••• 4242)'}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  stepContainer: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  stepTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  charLimit: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  sublabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray900,
    borderRadius: 50,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  textArea: {
    borderRadius: borderRadius.xl,
    height: 150,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadBox: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  uploadIcon: {
    fontSize: 32,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.gray400,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  optionButtonTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  scheduleOption: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  scheduleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  scheduleOptionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  scheduleOptionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: 50,
    alignItems: 'center',
  },
  yesNoButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  yesNoButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  applePayIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray900,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  appleIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: 'bold',
  },
  cardIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardEmoji: {
    fontSize: 28,
    color: colors.gray700,
    fontWeight: 'bold',
  },
  paymentOptionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  cardNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  checkmarkIcon: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiptContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  receiptHeader: {
    backgroundColor: colors.gray100,
    padding: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray200,
    borderStyle: 'dashed',
  },
  receiptHeaderText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  receiptBody: {
    padding: spacing.lg,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  receiptLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  receiptValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.gray300,
    marginVertical: spacing.md,
    borderStyle: 'dashed',
  },
  receiptRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  receiptLabelTotal: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  receiptValueTotal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  receiptFooter: {
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.gray200,
    borderStyle: 'dashed',
  },
  receiptFooterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reviewSectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reviewLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reviewValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.textSecondary,
  },
  reviewDateItem: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  nextButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  scheduleOptionTitleSelected: {
    color: colors.primary,
  },
  sectionLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  calendar: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeSlotsContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  dayScheduleCard: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedSlotsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  expandIcon: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  dayLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.textPrimary,
  },
  timeSlotsList: {
    gap: spacing.sm,
  },
  timeSlotCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  timeSlotCheckboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  timeSlotLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  timeSlotRange: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  useSavedAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  useSavedAddressText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  saveAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingTop: 0,
    paddingBottom: 25,
    paddingLeft: 0,
    marginTop: spacing.xs,
  },
  saveAddressText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
  statePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statePickerButtonActive: {
    // Active style
  },
  statePickerText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  statePickerPlaceholder: {
    color: colors.gray400,
  },
  stateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  stateModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  stateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  stateModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  statesList: {
    maxHeight: 400,
  },
  stateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  stateOptionSelected: {
    backgroundColor: colors.primary + '10',
  },
  stateOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  stateOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  mediaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mediaCountText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  mediaList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  mediaRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mediaItemText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  removePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.gray200,
  },
  removePillText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  photoThumbWrap: {
    width: 92,
    height: 92,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray100,
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  thumbRemoveBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRemoveBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 16,
  },
  uploadBoxCompact: {
    marginTop: 12,
    paddingVertical: 14,
  },
  mediaAddTile: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaAddTilePlus: {
    fontSize: 26,
    color: colors.gray700,
    marginBottom: 2,
  },
  mediaAddTileText: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '600',
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  videoTile: {
    width: 140,
    height: 92,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.gray100,
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  videoTileInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  videoTileName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  videoPlayBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayBadgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    marginLeft: 1,
  },
});
