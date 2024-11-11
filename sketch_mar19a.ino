#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>

const char* ssid = "The_R_family-2G"; // Replace with your WiFi SSID
const char* password = "P@$$w0rd"; // Replace with your WiFi password

ESP8266WebServer server(80);

SoftwareSerial arduino(D6, D5); // RX, TX

String sensorData = "{}"; // To store the sensor data as a JSON string

void setup() {
  Serial.begin(4800);
  arduino.begin(4800);

  Serial.println("Attempting to connect to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected to WiFi!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/data", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", sensorData);
  });

  server.begin();
}


void loop() {
  server.handleClient();

  if (arduino.available()) {
    String data = arduino.readStringUntil('\n');
    DynamicJsonDocument doc(256);
    auto error = deserializeJson(doc, data);

    if (!error) {
      sensorData = data; // Update the global sensorData string
      
      // Serial output for debugging
      Serial.println("Received JSON:");
      serializeJsonPretty(doc, Serial);
    } else {
      Serial.print("JSON parsing failed: ");
      Serial.println(error.c_str());
    }
  }
}
