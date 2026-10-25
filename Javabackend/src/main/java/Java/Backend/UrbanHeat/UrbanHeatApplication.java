package Java.Backend.UrbanHeat;

import Java.Backend.Entities.Ward;
import Java.Backend.Repositories.WardRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "Java.Backend")
@EntityScan(basePackageClasses = Ward.class)
@EnableJpaRepositories(basePackageClasses = WardRepository.class)
public class UrbanHeatApplication {

	public static void main(String[] args) {
		SpringApplication.run(UrbanHeatApplication.class, args);
	}

}
