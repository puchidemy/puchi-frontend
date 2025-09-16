import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";

const TermsPage = () => {
  return (
    <div className="container my-8 font-din">
      <Card className="p-0 md:p-10">
        <CardHeader>
          <CardTitle className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Terms and Conditions of Service
            </h1>
          </CardTitle>
          <CardDescription>
            <strong className="text-base">
              Please note that these Terms and Conditions of Service were last
              revised on November 10th, 2024
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal text-[18px] ml-6 space-y-4">
            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                General
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                Puchi websites (“Websites”) and related services are operated by
                Puchi , Inc. (“Puchi,” “us,” or “we”). Access and use of the
                Service is subject to the following Terms and Conditions of
                Service (“Terms and Conditions”). By accessing or using any part
                of the Service, you represent that you have read, understood,
                and agree to be bound by these Terms and Conditions including
                any future modifications. Puchi may amend, update, or change
                these Terms and Conditions. If we do this, we will post a notice
                that we have made changes to these Terms and Conditions on the
                Websites for at least 7 days after the changes are posted and
                will indicate at the bottom of the Terms and Conditions the date
                these terms were last revised. Any revisions to these Terms and
                Conditions will become effective the earlier of (i) the end of
                such 7-day period or (ii) the first time you access or use the
                Service after such changes. If you do not agree to abide by
                these Terms and Conditions, you are not authorized to use,
                access, or participate in the Service.
              </p>
              <strong className="text-gray-800 dark:text-gray-100">
                PLEASE NOTE THAT THESE TERMS AND CONDITIONS CONTAIN A MANDATORY
                ARBITRATION OF DISPUTES PROVISION THAT REQUIRES THE USE OF
                ARBITRATION ON AN INDIVIDUAL BASIS TO RESOLVE DISPUTES IN
                CERTAIN CIRCUMSTANCES, RATHER THAN JURY TRIALS OR CLASS ACTION
                LAWSUITS. VIEW THESE TERMS{" "}
                <Link
                  href="#arbitration"
                  className="underline underline-offset-2"
                >
                  HERE
                </Link>
                .
              </strong>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Description of Website and Service
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                The Service allows users to access and use a variety of
                educational services, including learning or practicing a
                language. Puchi may, in its sole discretion and at any time,
                update, change, suspend, make improvements to or discontinue any
                aspect of the Service, temporarily or permanently.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Acceptable Use of the Services
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                You are responsible for your use of the Services, and for any
                use of the Services made using your account. Our goal is to
                create a positive, useful, and safe user experience. To promote
                this goal, we prohibit certain kinds of conduct that may be
                harmful to other users or to us. When you use the Services, you
                must comply with our{" "}
                <Link
                  href="/guidelines"
                  className="underline underline-offset-1"
                >
                  Community Guidelines
                </Link>
                .
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Additional Terms
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                Some of our Services have additional terms and conditions
                (“Additional Terms”). Where Additional Terms apply to a Service,
                we will make them available for you to read through your use of
                that Service. By using that Service, you agree to the Additional
                Terms.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Registration
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                In connection with registering for and using the Service, you
                agree (i) to provide accurate, current and complete information
                about you and/or your organization as requested by Puchi; (ii)
                to maintain the confidentiality of your password and other
                information related to the security of your account; (iii) to
                maintain and promptly update any registration information you
                provide to Puchi, to keep such information accurate, current and
                complete; and (iv) to be fully responsible for all use of your
                account and for any actions that take place through your
                account.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Your Representations and Warranties
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-2">
                You represent and warrant to Puchi that your access and use of
                the Service will be in accordance with these Terms and
                Conditions and with all applicable laws, rules, and regulations
                of the United States and any other relevant jurisdiction,
                including those regarding online conduct or acceptable content,
                and those regarding the transmission of data or information
                exported from the United States and/or the jurisdiction in which
                you reside. You further represent and warrant that you have
                created or own any material you submit via the Service
                (including Activity Materials and Content) and that you have the
                right, as applicable, to grant us a license to use that material
                as set forth above or the right to assign that material to us as
                set forth below.
              </p>

              <p className="text-justify text-gray-700 dark:text-gray-300">
                You represent and warrant that you are not: (1) organized under
                the laws of, operating from, or otherwise ordinarily resident in
                a country or territory that is the target of comprehensive U.S.
                economic or trade sanctions (i.e., an embargo); (2) identified
                on a list of prohibited or restricted persons, such as the U.S.
                Treasury Department&apos;s List of Specially Designated Nationals and
                Blocked Persons; or (3) otherwise the target of U.S. sanctions.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Submission of Content
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                As a condition of submitting any ratings, reviews, information,
                data, text, photographs, audio clips, audiovisual works,
                translations, flashcards, or other materials on the Service
                (collectively, “Content”), you hereby grant to Puchi a
                full-paid, royalty free, perpetual, irrevocable, worldwide,
                nonexclusive, transferable, and sublicensable license to use,
                reproduce, copy, adapt, modify, merge, distribute, publicly
                display, and create derivative works from the Content;
                incorporate the Content into other works; and sublicense through
                multiple tiers the Content. You acknowledge that this license
                cannot be terminated by you once your Content is submitted to
                the Service. You represent that you own or have secured all
                legal rights necessary for the Content submitted by you to be
                used by you, Puchi, and others as described and otherwise
                contemplated in these Terms and Conditions. You understand that
                other users will have access to the Content and that neither
                they or Puchi have any obligation to you or anyone else to
                maintain the confidentiality of the Content. You will not
                upload, display, or otherwise provide on or through the Service
                any Content that: (i) is libelous, defamatory, abusive,
                threatening, harassing, hateful, offensive, or otherwise
                violates any law or infringes upon the right of any third party
                (including copyright, trademark, privacy, publicity, or other
                personal or proprietary rights); (ii) in Puchi&apos;s sole judgment,
                is objectionable, restricts or inhibits any other person from
                using the Service, or may expose Puchi or its users to any harm
                or liability of any kind; or (iii) violates Puchi&apos;s{" "}
                <Link
                  href="/guidelines"
                  className="underline underline-offset-1"
                >
                  Community Guidelines
                </Link>
                .
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Indemnification of Puchi
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                You agree to defend, indemnify and hold harmless Puchi and its
                directors, officers, employees, contractors, agents, suppliers,
                licensors, successors and assigns, from and against any and all
                losses, claims, causes of action, obligations, liabilities and
                damages whatsoever, including attorneys&apos; fees, arising out of or
                relating to your access or use of the Service, any false
                representation made to us (as part of these Terms and Conditions
                or otherwise), your breach of any of these Terms and Conditions,
                or any claim that any translation we provide to you is
                inaccurate, inappropriate or defective in any way whatsoever.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Third-Party Links, Sites, and Services
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-2">
                The Service may contain links to third-party websites,
                advertisers, services, special offers, or other events or
                activities that are not owned or controlled by Puchi. We do not
                endorse or assume any responsibility for any such third-party
                sites, information, materials, products, or services. If you
                access any third party website, service, or content from Puchi,
                you understand that these Terms and Conditions and our Privacy
                Policy do not apply to your use of such sites. You expressly
                acknowledge and agree that Puchi shall not be responsible or
                liable, directly or indirectly, for any damage or loss arising
                from your use of any third-party website, service, or content.
              </p>

              <p className="text-justify text-gray-700 dark:text-gray-300">
                The Service may include advertisements, which may be targeted to
                the Content or information on the Service, or other information.
                The types and extent of advertising by Puchi on the Service are
                subject to change. In consideration for Puchi granting you
                access to and use of the Service, you agree that Puchi and its
                third party providers and partners may place such advertising in
                connection with the display of content or information submitted
                by you or others.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                NO REPRESENTATIONS OR WARRANTIES BY PUCHI
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                THE SERVICE, INCLUDING ALL IMAGES, AUDIO FILES AND OTHER CONTENT
                THEREIN, AND ANY OTHER INFORMATION, PROPERTY AND RIGHTS GRANTED
                OR PROVIDED TO YOU BY PUCHI ARE PROVIDED TO YOU ON AN “AS IS”
                BASIS. PUCHI AND ITS SUPPLIERS MAKE NO REPRESENTATIONS OR
                WARRANTIES OF ANY KIND WITH RESPECT TO THE SERVICE, EITHER
                EXPRESS OR IMPLIED, AND ALL SUCH REPRESENTATIONS AND WARRANTIES,
                INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE OR NON-INFRINGEMENT, ARE EXPRESSLY
                DISCLAIMED. WITHOUT LIMITING THE GENERALITY OF THE FOREGOING,
                PUCHI DOES NOT MAKE ANY REPRESENTATION OR WARRANTY OF ANY KIND
                RELATING TO ACCURACY, SERVICE AVAILABILITY, COMPLETENESS,
                INFORMATIONAL CONTENT, ERROR-FREE OPERATION, RESULTS TO BE
                OBTAINED FROM USE, OR NON-INFRINGEMENT. ACCESS AND USE OF THE
                SERVICE MAY BE UNAVAILABLE DURING PERIODS OF PEAK DEMAND, SYSTEM
                UPGRADES, MALFUNCTIONS OR SCHEDULED OR UNSCHEDULED MAINTENANCE
                OR FOR OTHER REASONS. SOME JURISDICTIONS DO NOT ALLOW THE
                EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE EXCLUSION MAY NOT
                APPLY TO YOU.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Privacy
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                Use of the Service is also governed by our Privacy Policy, a
                copy of which is located at{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-1"
                  target="_blank"
                >
                  www.puchi.io.vn/en/privacy
                </Link>
                . By using the Service, you consent to the terms of the Privacy
                Policy.
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Language
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300">
                This agreement was originally written in English (US). To the
                extent any translated version of this agreement conflicts with
                the English version, the English version controls.
              </p>
            </li>
          </ol>
        </CardContent>
        <CardFooter>
          <p>Last revised on November 10th, 2024</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TermsPage;
