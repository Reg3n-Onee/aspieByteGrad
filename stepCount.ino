#include <ArduinoJson.h>
#include <dht11.h>
#include <SoftwareSerial.h>

#define DHT11PIN 7
#define X_PIN A1
#define Y_PIN A2
#define Z_PIN A3

dht11 DHT11;
SoftwareSerial nodemcu(5, 6); // TX, RX

float threshold = 6;
float xval[100] = {0};
float yval[100] = {0};
float zval[100] = {0};
float xavg, yavg, zavg;
int steps = 0, flag = 0;

void setup() {
  Serial.begin(4800);
  nodemcu.begin(4800);
  calibrate();
}

void loop() {
  int acc = 0;
  float totvect[100] = {0};
  float totave[100] = {0};
  float xaccl[100] = {0};
  float yaccl[100] = {0};
  float zaccl[100] = {0};

  // Static JSON document with sufficient capacity
  StaticJsonDocument<200> doc;

  for (int a = 0; a < 100; a++) {
    xaccl[a] = float(analogRead(X_PIN) - 345);
    delay(1);
    yaccl[a] = float(analogRead(Y_PIN) - 346);
    delay(1);
    zaccl[a] = float(analogRead(Z_PIN) - 416);
    delay(1);

    totvect[a] = sqrt(((xaccl[a] - xavg) * (xaccl[a] - xavg)) + 
                      ((yaccl[a] - yavg) * (yaccl[a] - yavg)) + 
                      ((zaccl[a] - zavg) * (zaccl[a] - zavg)));
    
    totave[a] = (totvect[a] + totvect[a - 1]) / 2;

    // Debugging total vector average
    Serial.print("totave[a]: ");
    Serial.println(totave[a]);
    delay(100);

    if (totave[a] > threshold && flag == 0) {
      steps += 1;
      flag = 1;
    } else if (totave[a] < threshold && flag == 1) {
      flag = 0;
    }

    // Avoid negative step count
    if (steps < 0) {
      steps = 0;
    }

    // Read DHT11 sensor data
    int chk = DHT11.read(DHT11PIN);
    float hum = DHT11.humidity;
    float fer = (DHT11.temperature * 9 / 5) + 32;

    // Populate JSON document
    doc["temperature"] = fer;
    doc["steps"] = steps;
    doc["humidity"] = hum;

    // Print sensor data for debugging
    Serial.println("Sensor Data:");
    Serial.print("Steps: ");
    Serial.println(steps);
    Serial.print("Humidity (%): ");
    Serial.println(hum, 2);
    Serial.print("Temperature (F): ");
    Serial.println(fer, 2);

    // Send JSON data to NodeMCU
    serializeJson(doc, nodemcu);
    nodemcu.println(); // Newline to indicate end of JSON message

    // Debug: Print the JSON being sent
    Serial.println("Sent JSON to NodeMCU:");
    serializeJsonPretty(doc, Serial);

    delay(2000); // Delay between readings

    // Recalibrate sensors
    calibrate();
  }

  delay(2000); // Additional delay
}

void calibrate() {
  float sum = 0;
  float sum1 = 0;
  float sum2 = 0;

  for (int i = 0; i < 100; i++) {
    xval[i] = float(analogRead(X_PIN) - 345);
    sum += xval[i];
  }
  xavg = sum / 100.0;
  Serial.print("xavg: ");
  Serial.println(xavg);
  delay(100);

  for (int j = 0; j < 100; j++) {
    yval[j] = float(analogRead(Y_PIN) - 346);
    sum1 += yval[j];
  }
  yavg = sum1 / 100.0;
  Serial.print("yavg: ");
  Serial.println(yavg);
  delay(100);

  for (int q = 0; q < 100; q++) {
    zval[q] = float(analogRead(Z_PIN) - 416);
    sum2 += zval[q];
  }
  zavg = sum2 / 100.0;
  Serial.print("zavg: ");
  Serial.println(zavg);
  delay(100);
}
