#include <SoftwareSerial.h>
#include <Servo.h>

Servo x;
int bttx = 9;   
int btrx = 10;   
int ledPin = 13; 
int socket = 8;

SoftwareSerial bluetooth(bttx, btrx);

void setup() {
  x.attach(11);    
  pinMode(ledPin, OUTPUT); 
  pinMode(socket, OUTPUT);
  digitalWrite(socket, LOW); // Initialize socket to OFF
  Serial.begin(9600);
  bluetooth.begin(9600);
}

void loop() {
  if (bluetooth.available() > 0) {   
    String command = bluetooth.readString();  
    Serial.println(command);   

    command.toLowerCase();

    if(command.indexOf("motor") != -1) {
         if(command.indexOf("left") != -1) {
            int Rotation = 0;
            for(int i = 0; i < command.length(); i++) {
              if(command[i] >= '0' && command[i] <= '9') {
                Rotation = Rotation * 10 + (command[i] - '0');
              }
            }
            x.write(-Rotation);
         } else if(command.indexOf("right") != -1) {
            int Rotation = 0;
            for(int i = 0; i < command.length(); i++) {
              if(command[i] >= '0' && command[i] <= '9') {
                Rotation = Rotation * 10 + (command[i] - '0');
              }
            }
            x.write(Rotation);
         }
    }
    
    if (command.indexOf("light") != -1) {
      if(command.indexOf("disco") != -1) {
          for(int i = 0; i < 20; i++) {
              digitalWrite(ledPin, HIGH);
              delay(300);
              digitalWrite(ledPin, LOW);
              delay(300);
          } 
          digitalWrite(ledPin, LOW);
      }
      else if(command.indexOf("after") != -1) {
          if(command.indexOf("on") != -1) {
            int time = 0;
            for(int i = 0; i < command.length(); i++) {
              if(command[i] >= '0' && command[i] <= '9') {
                time = time * 10 + (command[i] - '0');
              } else if(time) {
                 break;
              }
            }
            delay(time * 1000);
           digitalWrite(ledPin, HIGH);
          }
      }
      else if(command.indexOf("on") != -1) {
          digitalWrite(ledPin, HIGH);
      } else if(command.indexOf("off") != -1) {
          digitalWrite(ledPin, LOW);
      }
    }

    if (command.indexOf("socket") != -1) {
      if (command.indexOf("on") != -1) {
          digitalWrite(socket, HIGH); // Turn socket ON
      } else if (command.indexOf("off") != -1) {
          digitalWrite(socket, LOW);  // Turn socket OFF
      }
    }
  }
}