"use client";

import { useEffect } from "react";

export function PushProvider() {
  useEffect(() => {
    async function registerServiceWorker() {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          // next-pwa automatically generates and registers a sw.js file
          const registration = await navigator.serviceWorker.register("/sw.js");
          
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
             console.log("Push notifications permission denied");
             return;
          }

          // Fetch the VAPID key
          const response = await fetch("/api/web-push/vapid");
          const { vapidPublicKey } = await response.json();

          if (!vapidPublicKey) return;

          // Convert VAPID key for PushManager
          const urlBase64ToUint8Array = (base64String: string) => {
            const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
            const base64 = (base64String + padding)
              .replace(/\-/g, "+")
              .replace(/_/g, "/");
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
          };

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });

          // Send subscription to our backend
          await fetch("/api/web-push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription),
          });

        } catch (error) {
          console.error("Service Worker or Push registration failed:", error);
        }
      }
    }

    registerServiceWorker();
  }, []);

  return null;
}
