// include library for  PM sensor
#include "Adafruit_PM25AQI.h"

// variables 
int pollution = 0;
int maxValuePM25 = 0;
int readingPM25 = 0;
int maxValuePM10 = 0;
int readingPM10 = 0;
int PM25map = 0;
int PM10map = 0;
int MQ_value = 0;
int PM25SF = 0;
int PM10SF = 0;

#include <SoftwareSerial.h>
SoftwareSerial pmSerial(2, 3);

Adafruit_PM25AQI aqi = Adafruit_PM25AQI();

void setup() {
  // Wait for serial monitor to open
  Serial.begin(9600);
  while (!Serial) delay(10);

  // Wait one second for sensor to boot up
  delay(1000);
  
  pmSerial.begin(9600);

  if (! aqi.begin_UART(&pmSerial)) { // connect to the sensor over serial 
    while (1) delay(10);
  }
}

void loop() {
  PM25_AQI_Data data;
  
  if (! aqi.read(&data)) {
    delay(500);  // try again in a bit
    return;
  }

  readingPM25 = int(data.particles_03um);
  //Serial.println("pm2.5 reading:");
  //Serial.println(readingPM25);
  if (readingPM25 > 30000){
    readingPM25 = 30000;
  }
  
  PM25map = map(readingPM25, 0, 3000, 0, 254);
  //Serial.println("pm2.5 mapped reading:");
  //Serial.println(PM25map);
  
  readingPM10 = int(data.particles_10um);
  //Serial.println("pm10 reading:");
  //Serial.println(readingPM10);
  if (readingPM10 > 10000){
    readingPM10 = 10000;
  }
  
  PM10map = map(readingPM10, 0, 1000, 0, 254);
  //Serial.println("pm10 mapped reading:");
  //Serial.println(PM10map);
  
  MQ_value = analogRead(A0);
  if (MQ_value > 254) {
    MQ_value = 254;
  }

  Serial.print(PM25map);
  Serial.print(",");
  Serial.print(PM10map);
  Serial.print(",");
  Serial.println(MQ_value);
 
  delay(1000);
}
