import { ReportService } from '@repo/frontend-services/report';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/providers/ApiProvider';
import { useCityStore } from '@/stores/city.store';

export interface GpsCoords {
  latitude: number;
  longitude: number;
}

export type LocationState = { status: 'loading' } | { status: 'denied' } | { status: 'ready'; coords: GpsCoords };

export type PhotoState = { status: 'none' } | { status: 'picked'; uri: string; fileName: string; mimeType?: string };

export function useNewReport() {
  const api = useApi();
  const { cityId } = useCityStore();
  const reportService = useMemo(() => new ReportService(api, cityId), [api, cityId]);

  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState<PhotoState>({ status: 'none' });
  const [location, setLocation] = useState<LocationState>({ status: 'loading' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) {
        return;
      }
      if (status !== 'granted') {
        setLocation({ status: 'denied' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!cancelled) {
        setLocation({
          status: 'ready',
          coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        });
      }
    };

    fetchLocation().catch(() => {
      if (!cancelled) {
        setLocation({ status: 'denied' });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const retryLocation = async () => {
    setLocation({ status: 'loading' });
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({
        status: 'ready',
        coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
      });
    } catch {
      setLocation({ status: 'denied' });
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.fileName ?? `photo_${Date.now()}.jpg`;
      setPhoto({ status: 'picked', uri: asset.uri, fileName, mimeType: asset.mimeType ?? undefined });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const fileName = asset.fileName ?? `photo_${Date.now()}.jpg`;
      setPhoto({ status: 'picked', uri: asset.uri, fileName, mimeType: asset.mimeType ?? undefined });
    }
  };

  const removePhoto = () => {
    setPhoto({ status: 'none' });
  };

  const valid = desc.trim().length > 5 && photo.status === 'picked';

  const submit = async () => {
    if (!valid || submitting || photo.status !== 'picked') {
      return;
    }
    setSubmitting(true);
    try {
      await reportService.create({
        desc: desc.trim(),
        latitude: location.status === 'ready' ? location.coords.latitude : undefined,
        longitude: location.status === 'ready' ? location.coords.longitude : undefined,
        photo: { uri: photo.uri, fileName: photo.fileName, mimeType: photo.mimeType },
      });
      router.back();
    } catch {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    router.back();
  };

  return {
    desc,
    setDesc,
    photo,
    pickFromGallery,
    takePhoto,
    removePhoto,
    location,
    retryLocation,
    valid,
    submitting,
    submit,
    cancel,
  };
}
