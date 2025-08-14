import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FileText, Trash2, Download, X } from 'lucide-react-native';
import { useImageStore } from '@/stores/imageStore';
import { pdfService } from '@/services/pdfService';
import { apiService } from '@/services/apiService';

const { width, height } = Dimensions.get('window');

export default function GalleryScreen() {
  const { images, removeImage } = useImageStore();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };

  const generatePDF = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images Selected', 'Please select at least one image to generate PDF');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const selectedImageObjects = images.filter(img => selectedImages.includes(img.id));
      const pdfUri = await pdfService.createPDF(selectedImageObjects);
      
      Alert.alert(
        'PDF Generated', 
        'PDF created successfully! Do you want to upload it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upload', onPress: () => uploadPDF(pdfUri) },
        ]
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const uploadPDF = async (pdfUri: string) => {
    setIsUploading(true);
    try {
      const response = await apiService.uploadPDF(pdfUri);
      Alert.alert('Success', 'PDF uploaded successfully!');
      setSelectedImages([]);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      Alert.alert('Error', 'Failed to upload PDF. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = (id: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeImage(id) },
      ]
    );
  };

  const renderImageItem = ({ item }: { item: any }) => {
    const isSelected = selectedImages.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.imageContainer, isSelected && styles.selectedImage]}
        onPress={() => toggleImageSelection(item.id)}
        onLongPress={() => setPreviewImage(item.uri)}
      >
        <Image source={{ uri: item.uri }} style={styles.image} />
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <View style={styles.checkmark} />
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteImage(item.id)}
        >
          <Trash2 size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.subtitle}>
          {images.length} image{images.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={64} color="#6B7280" />
          <Text style={styles.emptyText}>No images captured yet</Text>
          <Text style={styles.emptySubtext}>Go to Camera tab to start taking photos</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.actionBar}>
            <Text style={styles.selectionText}>
              {selectedImages.length} selected
            </Text>
            <TouchableOpacity
              style={[
                styles.generateButton,
                selectedImages.length === 0 && styles.disabledButton
              ]}
              onPress={generatePDF}
              disabled={selectedImages.length === 0 || isGeneratingPDF || isUploading}
            >
              {isGeneratingPDF || isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <FileText size={20} color="#FFFFFF" />
              )}
              <Text style={styles.generateButtonText}>
                {isGeneratingPDF ? 'Generating...' : isUploading ? 'Uploading...' : 'Create PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={previewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPreviewImage(null)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  grid: {
    padding: 16,
  },
  imageContainer: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 6,
    borderRadius: 16,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 24,
  },
  previewImage: {
    width: width * 0.9,
    height: height * 0.7,
    resizeMode: 'contain',
  },
});