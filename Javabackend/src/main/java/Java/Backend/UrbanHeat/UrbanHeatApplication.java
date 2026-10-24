package Java.Backend.UrbanHeat;

import Java.Backend.Entities.Ward;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackageClasses = Ward.class)
public class UrbanHeatApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrbanHeatApplication.class, args);
	}

}
